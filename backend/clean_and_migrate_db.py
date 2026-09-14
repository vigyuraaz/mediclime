import sys
import os
import re

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.site_setting import SiteConfig
from app.models.article import Article
from app.models.product import Product
from sqlalchemy import text, inspect

def clean_markdown_string(text_val: str) -> str:
    if not text_val:
        return ""
    # Strip any accidental wrapping <h[1-6]>...</h[1-6]>
    text_clean = re.sub(r'^<h[1-6]>(.*)</h[1-6]>$', r'\1', text_val.strip(), flags=re.DOTALL)
    text_clean = re.sub(r'<p>\s*(#{1,6}\s+[^\n<]+)\s*<\/p>', r'\1', text_clean)

    if "##" in text_clean:
        parts = re.split(r'\s*##\s*', text_clean)
        html_sections = []
        for part in parts:
            part = part.strip()
            if not part:
                continue
            m_q = re.match(r'^(.*?\?)\s*(.*)$', part, re.DOTALL)
            m_phrase = re.match(
                r'^(Why you should use [^\n.]+?|Reviews of [^\n.]+?|[^\n.]+? benefits|[^\n.]+? money back guarantee|[^\n.]+? ingredients list|[^\n.]+? pros &amp; cons|[^\n.]+? pros & cons)\s+(.*)$',
                part, re.IGNORECASE | re.DOTALL
            )
            if m_q:
                heading = m_q.group(1).strip()
                body = m_q.group(2).strip()
            elif m_phrase:
                heading = m_phrase.group(1).strip()
                body = m_phrase.group(2).strip()
            else:
                m_first = re.match(r'^([^\n.]+[\.\?]?)\s*(.*)$', part, re.DOTALL)
                if m_first and len(m_first.group(1)) < 70:
                    heading = m_first.group(1).strip()
                    body = m_first.group(2).strip()
                else:
                    heading = ""
                    body = part

            sec_html = ""
            if heading:
                heading_clean = re.sub(r'^#+\s*', '', heading).strip()
                sec_html += f"<h2>{heading_clean}</h2>\n"
            if body:
                if " - " in body or "\n- " in body or body.startswith("- "):
                    bullet_split = re.split(r'(?:^|\s+)-\s+', body)
                    lead = bullet_split[0].strip()
                    bullets = bullet_split[1:]
                    if lead:
                        lead = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', lead)
                        sec_html += f"<p>{lead}</p>\n"
                    if bullets:
                        sec_html += "<ul>\n"
                        for b in bullets:
                            b_clean = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', b.strip())
                            sec_html += f"  <li>{b_clean}</li>\n"
                        sec_html += "</ul>\n"
                else:
                    body_clean = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', body)
                    sec_html += f"<p>{body_clean}</p>\n"
            html_sections.append(sec_html)
        return "\n".join(html_sections)
    
    return re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text_clean)


def migrate_and_clean():
    print("Step 1: Creating missing tables (including site_configs)...")
    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    
    print("\nStep 2: Checking and adding 'meta_keywords' column to 'articles'...")
    article_columns = [col['name'] for col in inspector.get_columns('articles')]
    if 'meta_keywords' not in article_columns:
        print("Adding column 'meta_keywords' to 'articles' table...")
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE articles ADD COLUMN meta_keywords TEXT"))
        print("Column 'meta_keywords' added to 'articles'.")
    else:
        print("Column 'meta_keywords' already exists on 'articles'.")

    print("\nStep 3: Checking and adding 'meta_keywords' column to 'products'...")
    product_columns = [col['name'] for col in inspector.get_columns('products')]
    if 'meta_keywords' not in product_columns:
        print("Adding column 'meta_keywords' to 'products' table...")
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE products ADD COLUMN meta_keywords TEXT"))
        print("Column 'meta_keywords' added to 'products'.")
    else:
        print("Column 'meta_keywords' already exists on 'products'.")

    print("\nStep 3b: Checking and adding 'google_search_console_verification' column to 'site_configs'...")
    site_config_columns = [col['name'] for col in inspector.get_columns('site_configs')]
    if 'google_search_console_verification' not in site_config_columns:
        print("Adding column 'google_search_console_verification' to 'site_configs' table...")
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE site_configs ADD COLUMN google_search_console_verification TEXT"))
        print("Column 'google_search_console_verification' added to 'site_configs'.")
    else:
        print("Column 'google_search_console_verification' already exists on 'site_configs'.")

    print("\nStep 3c: Checking and adding 'bing_webmaster_verification' column to 'site_configs'...")
    site_config_columns = [col['name'] for col in inspector.get_columns('site_configs')]
    if 'bing_webmaster_verification' not in site_config_columns:
        print("Adding column 'bing_webmaster_verification' to 'site_configs' table...")
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE site_configs ADD COLUMN bing_webmaster_verification TEXT"))
        print("Column 'bing_webmaster_verification' added to 'site_configs'.")
    else:
        print("Column 'bing_webmaster_verification' already exists on 'site_configs'.")


    db = SessionLocal()
    try:
        print("\nStep 4: Checking initial SiteConfig...")
        config = db.query(SiteConfig).first()
        if not config:
            print("Creating default SiteConfig...")
            config = SiteConfig(
                site_name="Mediclime",
                site_name_highlight="clime",
                site_tagline="Evidence-Led Health",
                site_description=(
                    "Mediclime is an evidence-first medical publishing platform combining peer-reviewed clinical summaries, "
                    "third-party verified nutraceutical facts, and daily therapeutic protocols."
                ),
                announcement_enabled=True,
                announcement_text="Clinical Evidence-First Editorial • Updated Medical Research 2026",
                default_meta_title="Mediclime — Evidence-Based Health & Supplement Reviews",
                default_meta_description=(
                    "Evidence-based medical publishing platform providing peer-reviewed clinical guides, supplement facts, and therapeutic wellness protocols."
                ),
                default_meta_keywords="medical blog, health guides, supplements, clinical nutrition, evidence-based wellness, neuropathy",
                contact_email="support@mediclime.com",
                contact_phone="+1 (800) 555-0199",
                footer_copyright="Mediclime Clinical Publishing Group. All rights reserved."
            )
            db.add(config)
            db.commit()
            print("Default SiteConfig created.")
        else:
            print(f"SiteConfig already exists: site_name='{config.site_name}'")

        print("\nStep 5: Cleaning existing products and populating meta_keywords...")
        products = db.query(Product).all()
        for p in products:
            changed = False
            # Clean description
            if p.description and ('##' in p.description or '**' in p.description):
                old_len = len(p.description)
                p.description = clean_markdown_string(p.description)
                print(f"Cleaned product #{p.id} ('{p.name}') markdown in description ({old_len} -> {len(p.description)} chars).")
                changed = True

            # Add default meta_keywords if missing
            if not p.meta_keywords:
                brand = p.brand or "Mediclime"
                category_name = p.category.name if p.category else "Neuropathy Support"
                p.meta_keywords = f"{p.name}, {brand}, {p.name} review, {category_name} supplement, clinical formula, health"
                print(f"Generated meta_keywords for product #{p.id} ('{p.name}'): {p.meta_keywords}")
                changed = True

            if changed:
                db.add(p)

        print("\nStep 6: Cleaning existing articles and populating meta_keywords...")
        articles = db.query(Article).all()
        for a in articles:
            changed = False
            # Clean content_blocks if they have raw hashes in headings
            if a.content_blocks:
                new_blocks = []
                for block in a.content_blocks:
                    if isinstance(block, dict):
                        b_copy = dict(block)
                        if b_copy.get("type") == "heading" and "text" in b_copy:
                            b_copy["text"] = re.sub(r'^#{1,6}\s+', '', b_copy["text"]).strip()
                        new_blocks.append(b_copy)
                    else:
                        new_blocks.append(block)
                a.content_blocks = new_blocks
                changed = True

            # Add default meta_keywords if missing
            if not a.meta_keywords:
                category_name = a.category.name if a.category else "Health"
                a.meta_keywords = f"{a.title}, {category_name}, clinical guide, evidence-based health, medical protocol, symptoms"
                print(f"Generated meta_keywords for article #{a.id} ('{a.title}'): {a.meta_keywords}")
                changed = True

            if changed:
                db.add(a)

        db.commit()
        print("\nDatabase migration and data cleanup completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"\nERROR during migration: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    migrate_and_clean()
