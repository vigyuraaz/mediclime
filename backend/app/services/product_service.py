from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.models.product import (
    Product, ProductBenefit, ProductIngredient, SupplementFact, ProductFAQ, ProductStatus
)
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.article_service import generate_slug

class ProductService:
    def get_products(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
        category_id: Optional[int] = None,
        brand: Optional[str] = None,
        search: Optional[str] = None
    ) -> Tuple[List[Product], int]:
        query = db.query(Product)
        
        if status:
            query = query.filter(Product.status == status)
        if category_id:
            query = query.filter(Product.category_id == category_id)
        if brand:
            query = query.filter(Product.brand.ilike(f"%{brand}%"))
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_filter),
                    Product.brand.ilike(search_filter),
                    Product.short_description.ilike(search_filter)
                )
            )
            
        total = query.count()
        products = query.order_by(desc(Product.created_at)).offset(skip).limit(limit).all()
        return products, total

    def get_product_by_slug(self, db: Session, slug: str, public_only: bool = True) -> Optional[Product]:
        query = db.query(Product).filter(Product.slug == slug)
        if public_only:
            query = query.filter(Product.status == ProductStatus.PUBLISHED.value)
        return query.first()

    def get_product_by_id(self, db: Session, product_id: int) -> Optional[Product]:
        return db.query(Product).filter(Product.id == product_id).first()

    def create_product(self, db: Session, data: ProductCreate) -> Product:
        slug = data.slug or generate_slug(f"{data.name}-{data.brand}")
        base_slug = slug
        counter = 1
        while db.query(Product).filter(Product.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1

        product = Product(
            name=data.name,
            brand=data.brand,
            slug=slug,
            short_description=data.short_description,
            description=data.description,
            category_id=data.category_id,
            status=data.status or ProductStatus.DRAFT.value,
            rating=data.rating or 4.8,
            review_count=data.review_count or 0,
            price=data.price or 0.0,
            currency=data.currency or "USD",
            availability=data.availability or "In Stock",
            serving_size=data.serving_size or "2 Capsules Daily",
            form=data.form or "Vegetarian Capsules",
            featured_image_url=data.featured_image_url,
            gallery_images=data.gallery_images or [],
            highlight_badges=data.highlight_badges or [],
            dosage=data.dosage,
            directions=data.directions,
            warnings=data.warnings,
            allergens=data.allergens,
            contraindications=data.contraindications,
            storage=data.storage,
            disclaimer=data.disclaimer,
            seo_title=data.seo_title or data.name,
            seo_description=data.seo_description or data.short_description,
            meta_keywords=data.meta_keywords
        )
        db.add(product)
        db.flush()

        # Add Benefits
        for b in data.benefits:
            benefit = ProductBenefit(
                product_id=product.id,
                benefit=b.benefit,
                description=b.description,
                icon_name=b.icon_name,
                sort_order=b.sort_order or 0
            )
            db.add(benefit)

        # Add Ingredients
        for ing in data.ingredients:
            ingredient = ProductIngredient(
                product_id=product.id,
                name=ing.name,
                amount=ing.amount,
                unit=ing.unit,
                daily_value=ing.daily_value,
                notes=ing.notes,
                sort_order=ing.sort_order or 0
            )
            db.add(ingredient)

        # Add Supplement Facts
        for fact in data.supplement_facts:
            s_fact = SupplementFact(
                product_id=product.id,
                ingredient_name=fact.ingredient_name,
                amount=fact.amount,
                unit=fact.unit,
                daily_value=fact.daily_value,
                sort_order=fact.sort_order or 0
            )
            db.add(s_fact)

        # Add FAQs
        for f in data.faqs:
            faq = ProductFAQ(
                product_id=product.id,
                question=f.question,
                answer=f.answer,
                sort_order=f.sort_order or 0
            )
            db.add(faq)

        db.commit()
        db.refresh(product)
        return product

    def update_product(self, db: Session, product_id: int, data: ProductUpdate) -> Optional[Product]:
        product = self.get_product_by_id(db, product_id)
        if not product:
            return None

        update_data = data.model_dump(exclude_unset=True)
        if "slug" in update_data and update_data["slug"] != product.slug:
            new_slug = update_data["slug"]
            if db.query(Product).filter(Product.slug == new_slug, Product.id != product_id).first():
                raise ValueError("A product with this slug already exists")

        for key, value in update_data.items():
            setattr(product, key, value)

        db.commit()
        db.refresh(product)
        return product

    def delete_product(self, db: Session, product_id: int) -> bool:
        product = self.get_product_by_id(db, product_id)
        if not product:
            return False
        db.delete(product)
        db.commit()
        return True

product_service = ProductService()
