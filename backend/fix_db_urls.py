import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.media import Media
from app.models.product import Product
from app.models.article import Article

def fix_urls():
    engine = create_engine(settings.DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    old_prefix = "https://9f456dea5331cb61ba38ad8bce72f583.r2.cloudflarestorage.com/mediaclime-media/"
    new_prefix = "https://pub-86f1abeb043f48849bfcfb81cfc6481a.r2.dev/"

    # Fix Media
    medias = session.query(Media).all()
    media_count = 0
    for m in medias:
        if m.url and m.url.startswith(old_prefix):
            m.url = m.url.replace(old_prefix, new_prefix)
            media_count += 1

    # Fix Products
    products = session.query(Product).all()
    product_count = 0
    for p in products:
        if p.featured_image_url and p.featured_image_url.startswith(old_prefix):
            p.featured_image_url = p.featured_image_url.replace(old_prefix, new_prefix)
            product_count += 1

    # Fix Articles
    articles = session.query(Article).all()
    article_count = 0
    for a in articles:
        if a.featured_image_url and a.featured_image_url.startswith(old_prefix):
            a.featured_image_url = a.featured_image_url.replace(old_prefix, new_prefix)
            article_count += 1

    session.commit()
    print(f"Fixed {media_count} media items, {product_count} products, {article_count} articles.")

if __name__ == "__main__":
    fix_urls()
