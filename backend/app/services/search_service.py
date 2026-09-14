from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.article import Article, ArticleStatus
from app.models.product import Product, ProductStatus
from app.models.condition import Condition
from app.models.author import Author
from app.models.category import Category
from app.schemas.search import SearchResultItem, SearchResponse

class SearchService:
    def search(self, db: Session, query: str, limit_per_type: int = 5) -> SearchResponse:
        results: List[SearchResultItem] = []
        if not query or not query.strip():
            return SearchResponse(query=query, total=0, results=[])

        q_filter = f"%{query.strip()}%"

        # 1. Search Published Articles
        articles = db.query(Article).filter(
            Article.status == ArticleStatus.PUBLISHED.value,
            or_(
                Article.title.ilike(q_filter),
                Article.subtitle.ilike(q_filter),
                Article.excerpt.ilike(q_filter)
            )
        ).limit(limit_per_type).all()

        for art in articles:
            results.append(SearchResultItem(
                type="article",
                id=art.id,
                title=art.title,
                slug=art.slug,
                excerpt=art.excerpt or art.subtitle,
                image_url=art.featured_image_url,
                badge=art.category.name if art.category else "Medical Article",
                url=f"/articles/{art.slug}"
            ))

        # 2. Search Published Products
        products = db.query(Product).filter(
            Product.status == ProductStatus.PUBLISHED.value,
            or_(
                Product.name.ilike(q_filter),
                Product.brand.ilike(q_filter),
                Product.short_description.ilike(q_filter)
            )
        ).limit(limit_per_type).all()

        for prod in products:
            results.append(SearchResultItem(
                type="product",
                id=prod.id,
                title=f"{prod.name} ({prod.brand})",
                slug=prod.slug,
                excerpt=prod.short_description,
                image_url=prod.featured_image_url,
                badge="Supplement Review",
                url=f"/supplements/{prod.slug}"
            ))

        # 3. Search Conditions
        conditions = db.query(Condition).filter(
            or_(
                Condition.name.ilike(q_filter),
                Condition.summary.ilike(q_filter)
            )
        ).limit(limit_per_type).all()

        for cond in conditions:
            results.append(SearchResultItem(
                type="condition",
                id=cond.id,
                title=cond.name,
                slug=cond.slug,
                excerpt=cond.summary,
                image_url=cond.featured_image,
                badge="Health Condition",
                url=f"/health/{cond.slug}"
            ))

        # 4. Search Authors
        authors = db.query(Author).filter(
            or_(
                Author.name.ilike(q_filter),
                Author.professional_title.ilike(q_filter),
                Author.credentials.ilike(q_filter)
            )
        ).limit(limit_per_type).all()

        for auth in authors:
            results.append(SearchResultItem(
                type="author",
                id=auth.id,
                title=f"{auth.name}, {auth.credentials or ''}".strip(", "),
                slug=auth.slug,
                excerpt=auth.professional_title,
                image_url=auth.profile_image,
                badge="Medical Board",
                url=f"/authors/{auth.slug}"
            ))

        return SearchResponse(
            query=query,
            total=len(results),
            results=results
        )

search_service = SearchService()
