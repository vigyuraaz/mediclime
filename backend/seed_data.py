"""
Seed script to import all existing clinical articles, supplements, conditions, authors, and FAQs into the database.
"""
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_api_key, get_password_hash
from app.models.user import User, UserRole
from app.models.api_key import ApiKey
from app.models.author import Author
from app.models.category import Category, Tag
from app.models.condition import Condition
from app.models.product import Product, ProductBenefit, ProductIngredient, SupplementFact, ProductFAQ, ProductStatus
from app.models.article import Article, ArticleFAQ, ArticleSource, ArticleStatus, MedicalReviewStatus

def seed_database():
    print("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Admin User
        admin_user = db.query(User).filter(User.email == "admin@mediclime.com").first()
        if not admin_user:
            admin_user = User(
                email="admin@mediclime.com",
                password_hash=get_password_hash("MediclimeAdmin2026!"),
                name="Mediclime Super Admin",
                role=UserRole.SUPER_ADMIN.value,
                is_active=True
            )
            db.add(admin_user)
            db.flush()
            print("Created admin user: admin@mediclime.com / MediclimeAdmin2026!")

        # 2. Seed Test API Key
        test_raw_key = "med_live_demo_test_api_key_2026"
        key_hash = hash_api_key(test_raw_key)
        existing_key = db.query(ApiKey).filter(ApiKey.key_hash == key_hash).first()
        if not existing_key:
            api_key = ApiKey(
                name="Automation CLI Test Key",
                key_hash=key_hash,
                prefix="med_live_demo...2026",
                permissions=["article:create", "article:publish", "product:create", "ai:generate"],
                created_by_id=admin_user.id
            )
            db.add(api_key)
            db.flush()
            print(f"Created seeded API key for scripts: {test_raw_key}")

        # 3. Seed Authors
        authors_data = [
            {
                "name": "Dr. Emily Langford, MD",
                "slug": "emily-langford",
                "professional_title": "Board-Certified Neurologist & Clinical Researcher",
                "credentials": "MD, FAAN",
                "short_bio": "Dr. Langford specializes in peripheral axon regeneration and metabolic neuropathies at Johns Hopkins.",
                "full_bio": "Dr. Emily Langford completed her residency in Neurology at Johns Hopkins Hospital and has published over 40 peer-reviewed papers on peripheral nerve micro-vascular circulation.",
                "areas_of_expertise": ["Peripheral Neuropathy", "Neuroinflammation", "Axon Regeneration", "Clinical Trials"],
                "hospital_affiliations": ["Johns Hopkins Medicine", "American Academy of Neurology"],
                "is_medical_reviewer": True,
                "profile_image": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
            },
            {
                "name": "Dr. Marcus Chen, PharmD",
                "slug": "marcus-chen",
                "professional_title": "Clinical Pharmacologist & Nutraceutical Formulation Lead",
                "credentials": "PharmD, BCPS",
                "short_bio": "Expert in micronutrient bioavailability, botanical drug interactions, and HPLC compound verification.",
                "full_bio": "Dr. Marcus Chen serves as an independent formulation consultant and reviewer for dietary supplement safety, specializing in pharmacokinetics and CYP450 interactions.",
                "areas_of_expertise": ["Pharmacokinetics", "Nutraceutical Chemistry", "Drug-Nutrient Interactions", "Dietary Supplement Safety"],
                "hospital_affiliations": ["University of California San Francisco", "American College of Clinical Pharmacy"],
                "is_medical_reviewer": True,
                "profile_image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300"
            },
            {
                "name": "Dr. Nathan Brooks, MD",
                "slug": "nathan-brooks",
                "professional_title": "Endocrinologist & Metabolic Health Specialist",
                "credentials": "MD, FACE",
                "short_bio": "Investigating postprandial insulin spikes, advanced glycation end-products (AGEs), and nerve sheath integrity.",
                "full_bio": "Dr. Nathan Brooks is an active clinical endocrinologist focusing on insulin resistance protocols and metabolic lifestyle interventions.",
                "areas_of_expertise": ["Metabolic Syndrome", "Insulin Sensitivity", "Advanced Glycation", "Nutritional Biochemistry"],
                "hospital_affiliations": ["Mayo Clinic Care Network", "Endocrine Society"],
                "is_medical_reviewer": True,
                "profile_image": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300"
            },
            {
                "name": "Sarah Jenkins, MS, RD",
                "slug": "sarah-jenkins",
                "professional_title": "Registered Dietitian & Clinical Nutritionist",
                "credentials": "MS, RD, CDN",
                "short_bio": "Translating clinical trials into anti-inflammatory culinary protocols and micronutrient optimization strategies.",
                "full_bio": "Sarah Jenkins holds a Master of Science in Clinical Nutrition from Columbia University and specializes in therapeutic diets for autoimmune and metabolic disorders.",
                "areas_of_expertise": ["Functional Nutrition", "Gut Microbiome", "Anti-Inflammatory Diets", "Micronutrient Synergy"],
                "hospital_affiliations": ["Academy of Nutrition and Dietetics"],
                "is_medical_reviewer": False,
                "profile_image": "https://images.unsplash.com/photo-1594824813588-4682057398f5?auto=format&fit=crop&q=80&w=300"
            }
        ]

        author_map = {}
        for a_data in authors_data:
            existing = db.query(Author).filter(Author.slug == a_data["slug"]).first()
            if not existing:
                existing = Author(**a_data)
                db.add(existing)
                db.flush()
            author_map[a_data["slug"]] = existing
        print(f"Seeded {len(authors_data)} medical authors.")

        # 4. Seed Categories
        categories_data = [
            {"name": "Nervous Health", "slug": "nervous-health", "icon_name": "brain", "sort_order": 1},
            {"name": "Metabolic Support", "slug": "metabolic-support", "icon_name": "activity", "sort_order": 2},
            {"name": "Sleep & Circadian", "slug": "sleep-circadian", "icon_name": "moon", "sort_order": 3},
            {"name": "Cellular Nutrition", "slug": "cellular-nutrition", "icon_name": "shield", "sort_order": 4},
            {"name": "Musculoskeletal", "slug": "musculoskeletal", "icon_name": "heart", "sort_order": 5}
        ]
        cat_map = {}
        for c_data in categories_data:
            existing = db.query(Category).filter(Category.slug == c_data["slug"]).first()
            if not existing:
                existing = Category(**c_data)
                db.add(existing)
                db.flush()
            cat_map[c_data["slug"]] = existing
        print(f"Seeded {len(categories_data)} categories.")

        # 5. Seed Conditions (sample high-yield conditions)
        conditions_data = [
            {
                "name": "Peripheral Neuropathy",
                "slug": "peripheral-neuropathy",
                "summary": "Nerve damage causing tingling, numbness, and burning pain, usually beginning in the feet and hands.",
                "category_id": cat_map["nervous-health"].id,
                "symptoms": ["Burning sensation in feet and toes", "Numbness or reduced sensitivity to touch", "Sharp, jabbing, electrical-like pains", "Extreme sensitivity to touch (allodynia)", "Loss of balance and motor coordination"],
                "causes": ["Type 2 Diabetes & Chronic Hyperglycemia", "Chemotherapy-Induced Peripheral Neuropathy (CIPN)", "Vitamin B12 Deficiency & Pernicious Anemia", "Chronic Microvascular Insufficiency", "Autoimmune Neuropathies (Guillain-Barré, CIDP)"],
                "risk_factors": ["Poorly controlled blood sugar levels", "Alcohol misuse and chronic nutrient depletion", "Repetitive mechanical nerve compression", "Family history of neurological conditions"],
                "diagnosis_info": ["Comprehensive Neurological Exam & Reflex Testing", "Electromyography (EMG) & Nerve Conduction Studies", "Skin Biopsy for Intraepidermal Nerve Fiber Density", "Laboratory Blood Panels (HbA1c, B12, MMA, TSH)"],
                "treatments": ["Targeted nutraceutical support (PEA, R-ALA, Benfotiamine)", "Glycemic sequencing and dietary carbohydrate regulation", "Seated sciatic nerve flossing exercises", "Low-impact contrast foot hydrotherapy", "Properly fitted orthopedic footwear"],
                "when_to_seek_care": "Seek prompt medical attention if tingling spreads above your ankles, if you develop an unhealing ulcer on your feet, or if motor weakness impairs walking.",
                "seo_title": "Peripheral Neuropathy: Evidence-Based Pathology, Symptoms, and Nutrients | Mediclime",
                "seo_description": "Comprehensive clinical review of peripheral neuropathy mechanisms, early warning signs, clinical trials for PEA and R-ALA, and daily habits."
            },
            {
                "name": "Sleep Latency & Insomnia",
                "slug": "sleep-latency-insomnia",
                "summary": "Difficulty initiating and maintaining deep slow-wave restorative sleep, resulting in cognitive fatigue and elevated cortisol.",
                "category_id": cat_map["sleep-circadian"].id,
                "symptoms": ["Prolonged sleep onset latency exceeding 30 minutes", "Frequent mid-night awakenings with inability to fall back asleep", "Waking up feeling unrefreshed and lethargic", "Daytime cognitive brain fog and irritable mood"],
                "causes": ["Circadian melatonin suppression from evening blue light", "Elevated evening autonomic sympathetic tone", "Magnesium deficiency and NMDA receptor hyper-excitability", "Excess caffeine consumption past midday"],
                "treatments": ["Targeted GABAergic and Magnesium L-Threonate supplementation", "Morning outdoor sunlight exposure within 30 minutes of waking", "Strict digital device curfew 60 minutes before bed", "Temperature optimization maintaining bedroom between 65-68°F"]
            }
        ]
        for cond_data in conditions_data:
            existing = db.query(Condition).filter(Condition.slug == cond_data["slug"]).first()
            if not existing:
                existing = Condition(**cond_data)
                db.add(existing)
                db.flush()
        print(f"Seeded conditions.")

        # 6. Seed Arialief Supplement (Faithful evolution of supplement details)
        arialief = db.query(Product).filter(Product.slug == "arialief-neuropathy-pain-relief").first()
        if not arialief:
            arialief = Product(
                name="Arialief Neuropathy Pain Relief",
                brand="Arialief Clinical Formulations",
                slug="arialief-neuropathy-pain-relief",
                short_description="High-potency clinical nerve support complex featuring micronized Palmitoylethanolamide (PEA), stabilized R-Alpha Lipoic Acid, and neurotrophic vitamins.",
                description="Arialief is an evidence-based clinical nutraceutical formulated specifically to calm hyperactive peripheral nerve firing, protect endoneurial micro-capillaries from oxidative strain, and accelerate myelin sheath maintenance.",
                category_id=cat_map["nervous-health"].id,
                status=ProductStatus.PUBLISHED.value,
                rating=4.9,
                review_count=1847,
                price=59.0,
                currency="USD",
                availability="In Stock (Ships in 24h)",
                serving_size="2 Vegetarian Capsules Daily",
                form="Vegetarian Capsules",
                featured_image_url="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
                highlight_badges=["GMP Certified Facility", "Third-Party ISO-17025 Lab Tested", "Non-GMO & Vegan", "Physician Formulated"],
                dosage="Take 2 capsules once daily with 8 oz of water, preferably 30 minutes before a meal.",
                directions="Consistent daily supplementation for at least 60 to 90 days is clinically advised to support full endoneurial microvascular perfusion.",
                warnings="Keep out of reach of children. Consult a qualified healthcare professional before taking if pregnant, nursing, taking prescription anticoagulants, or managing insulin.",
                allergens="Free of gluten, wheat, dairy, soy, eggs, shellfish, and artificial dyes.",
                storage="Store at room temperature (59°F–77°F) away from heat and moisture.",
                disclaimer="These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.",
                seo_title="Arialief Review: Clinical Neuropathy Formula, Supplement Facts & Lab Verification",
                seo_description="In-depth clinical evaluation of Arialief neuropathy relief supplement. Examine ingredient concentrations, PEA bioavailability, lab purity data, and user clinical outcomes.",
                meta_keywords="Arialief, neuropathy pain relief, PEA, R-Alpha Lipoic Acid, peripheral neuropathy, nerve support formula, clinical supplement"
            )
            db.add(arialief)
            db.flush()

            # Add Benefits
            benefits = [
                {"benefit": "Calms Hyperactive Nerve Signals", "description": "Micronized PEA stabilizes peripheral mast cells and down-regulates spinal pain neurotransmission.", "sort_order": 1},
                {"benefit": "Endoneurial Microvascular Perfusion", "description": "Stabilized R-ALA neutralizes reactive oxygen species and improves blood flow to distal extremities.", "sort_order": 2},
                {"benefit": "Myelin Sheath Resilience", "description": "Methylated B-Vitamins and Benfotiamine facilitate myelin lipid reconstruction and metabolic efficiency.", "sort_order": 3}
            ]
            for b in benefits:
                db.add(ProductBenefit(product_id=arialief.id, **b))

            # Add Supplement Facts
            facts = [
                {"ingredient_name": "Palmitoylethanolamide (Micronized PEA)", "amount": "400 mg", "daily_value": "**", "sort_order": 1},
                {"ingredient_name": "R-Alpha Lipoic Acid (Stabilized Na-RALA)", "amount": "300 mg", "daily_value": "**", "sort_order": 2},
                {"ingredient_name": "Benfotiamine (Fat-Soluble B1)", "amount": "150 mg", "daily_value": "12500%", "sort_order": 3},
                {"ingredient_name": "Methylcobalamin (Active Vitamin B12)", "amount": "1000 mcg", "daily_value": "41667%", "sort_order": 4},
                {"ingredient_name": "Magnesium (as Glycinate Chelate)", "amount": "120 mg", "daily_value": "29%", "sort_order": 5}
            ]
            for f in facts:
                db.add(SupplementFact(product_id=arialief.id, **f))

            # Add FAQs
            faqs = [
                {"question": "How soon do most individuals experience symptom relief?", "answer": "In clinical observation, early reduction in nocturnal tingling and burning begins around week 3 to 4, with peak nerve comfort reached by week 10.", "sort_order": 1},
                {"question": "Can Arialief be safely combined with prescription nerve medications?", "answer": "Arialief contains natural autacoids and water/lipid vitamins with no known drug habituation. However, always verify potential interactions with your physician.", "sort_order": 2}
            ]
            for f in faqs:
                db.add(ProductFAQ(product_id=arialief.id, **f))
            print("Seeded Arialief supplement.")

        # 7. Seed Landmark Article (Faithful evolution of article details)
        neuropathy_article = db.query(Article).filter(Article.slug == "understanding-peripheral-neuropathy").first()
        if not neuropathy_article:
            neuropathy_article = Article(
                title="Understanding Peripheral Neuropathy: Evidence-Based Management, Key Nutrients, and Daily Support Strategies",
                slug="understanding-peripheral-neuropathy",
                subtitle="A comprehensive clinical review on nerve fiber recovery, clinical trial insights for PEA and Alpha Lipoic Acid, and holistic habits to quiet hyperactive peripheral nerve firing.",
                excerpt="Peripheral neuropathy affects over 30 million Americans. This peer-reviewed clinical guide explores cellular pathology, evidence-graded nutrients, and practical nerve flossing protocols.",
                category_id=cat_map["nervous-health"].id,
                author_id=author_map["emily-langford"].id,
                reviewer_id=author_map["marcus-chen"].id,
                status=ArticleStatus.PUBLISHED.value,
                medical_review_status=MedicalReviewStatus.APPROVED.value,
                reading_time="12 Min Read",
                word_count=2200,
                featured_image_url="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800",
                is_featured=True,
                is_trending=True,
                seo_title="Understanding Peripheral Neuropathy: Evidence-Based Management | Mediclime",
                seo_description="Clinical review by Dr. Emily Langford MD and Dr. Marcus Chen PharmD on peripheral nerve recovery, PEA, Alpha Lipoic Acid, and nerve glides.",
                meta_keywords="peripheral neuropathy, PEA, Palmitoylethanolamide, Alpha Lipoic Acid, nerve recovery, nerve flossing, myelin sheath, neuropathy protocol",
                executive_summary=[
                    {"bold": "Mitochondrial & Axon Stress:", "text": "Neuropathic pain originates when peripheral myelin sheaths deteriorate and mitochondria fail to supply adequate ATP for electrical signaling."},
                    {"bold": "PEA (Palmitoylethanolamide):", "text": "Clinical trials confirm PEA regulates hyperactive mast cells and downregulates spinal neuroinflammation without pharmacological dependency."},
                    {"bold": "R-Alpha Lipoic Acid Synergy:", "text": "Provides targeted fat- and water-soluble antioxidant coverage to improve microvascular endoneurial blood flow to damaged extremities."},
                    {"bold": "Multi-Modal Approach:", "text": "Nutrient supplementation achieves peak efficacy when paired with glycemic stability, low-impact nerve flossing, and strict footwear optimization."}
                ],
                content_blocks=[
                    {
                        "type": "heading",
                        "level": 2,
                        "text": "1. What Really Causes Neuropathic Sensations?"
                    },
                    {
                        "type": "paragraph",
                        "text": "Peripheral neuropathy is not a single disease entity; rather, it is the downstream manifestation of micro-vascular insufficiency, chronic metabolic strain, and progressive degradation of peripheral sensory axons. Affecting over 30 million Americans, symptoms typically manifest in a 'glove-and-stocking' distribution—beginning in the distal toes and ascending toward the calves."
                    },
                    {
                        "type": "paragraph",
                        "text": "Under normal physiological circumstances, peripheral nerve fibers utilize high concentrations of adenosine triphosphate (ATP) generated by cellular mitochondria to pump sodium and potassium ions against concentration gradients. When micro-capillary circulation is compromised (endoneurial hypoxia), these energy-starved cells become hyperexcitable, firing spontaneously and sending erratic pain, burning, or tingling signals to the central nervous system."
                    },
                    {
                        "type": "callout",
                        "variant": "info",
                        "title": "Clinical Practice Observation",
                        "text": "Recent clinical meta-analyses demonstrate that early nutritional intervention can significantly attenuate oxidative damage in peripheral nerve endings before structural axon death occurs."
                    },
                    {
                        "type": "heading",
                        "level": 2,
                        "text": "2. Targeted Botanical and Mineral Compounds"
                    },
                    {
                        "type": "paragraph",
                        "text": "While pharmaceutical options like gabapentinoids and SNRIs are frequently prescribed to dull the perception of pain, they do not repair peripheral nerve integrity. Clinical research over the past decade has identified several key compounds that directly support nerve restoration and reduce systemic micro-inflammation."
                    },
                    {
                        "type": "nutrient_card",
                        "data": {
                            "name": "A. Palmitoylethanolamide (PEA)",
                            "grade": "Evidence Grade: A-",
                            "description": "PEA is an endogenous fatty acid amide synthesized by cells in response to tissue injury. It acts as an ALIAmide (Autacoid Local Injury Antagonism), down-regulating overactive mast cells situated near nerve terminations.",
                            "dosage": "300 mg – 600 mg twice daily (micronized form)",
                            "mechanism": "PPAR-α Activation & Mast Cell Calming"
                        }
                    },
                    {
                        "type": "nutrient_card",
                        "data": {
                            "name": "B. R-Alpha Lipoic Acid (R-ALA)",
                            "grade": "Evidence Grade: A",
                            "description": "Unlike generic synthetic ALA, the biologically active R-enantiomer crosses both lipid and aqueous cellular boundaries. Clinical trials (including the landmark ALADIN study) observed significant improvements in sensory paresthesia, motor nerve conduction velocity, and distal micro-capillary perfusion.",
                            "dosage": "300 mg – 600 mg daily on empty stomach",
                            "mechanism": "Endoneurial ROS Neutralization"
                        }
                    },
                    {
                        "type": "nutrient_card",
                        "data": {
                            "name": "C. Highly Bioavailable Magnesium Glycinate",
                            "grade": "Evidence Grade: B+",
                            "description": "Magnesium serves as a gatekeeper for the NMDA receptors in the spinal cord. When systemic magnesium is depleted, NMDA receptors remain constantly activated, magnifying pain signals into central sensitization. Chelation with glycine ensures optimal neurological absorption without GI distress.",
                            "dosage": "200 mg – 400 mg in the evening",
                            "mechanism": "NMDA-Receptor Voltage Gating"
                        }
                    },
                    {
                        "type": "heading",
                        "level": 2,
                        "text": "3. Lifestyle Interventions & Nerve Flossing Exercises"
                    },
                    {
                        "type": "paragraph",
                        "text": "Nutraceuticals work best when paired with mechanical nerve mobilization. Nerve glide exercises (also known as neural flossing) reduce adhesion between the sciatic and peroneal nerves and surrounding myofascial tissues, restoring smooth excursion and promoting lymph drainage."
                    }
                ]
            )
            db.add(neuropathy_article)
            db.flush()

            # FAQs
            db.add(ArticleFAQ(
                article_id=neuropathy_article.id,
                question="Can damaged peripheral nerves actually regenerate?",
                answer="Peripheral nerves possess an innate regenerative capacity of roughly 1 mm per day under favorable physiological conditions—namely, glycemic stability, adequate endoneurial microcirculation, and sufficient neurotrophic vitamins.",
                sort_order=1
            ))
            db.add(ArticleFAQ(
                article_id=neuropathy_article.id,
                question="How long does it take for PEA and Alpha Lipoic Acid to work?",
                answer="Double-blind trials indicate measurable sensory improvements typically manifest between weeks 4 and 6, with sustained cellular benefits stabilizing between 90 and 120 days.",
                sort_order=2
            ))

            # Sources
            db.add(ArticleSource(
                article_id=neuropathy_article.id,
                title="Palmitoylethanolamide in the treatment of chronic pain: a systematic review and meta-analysis of randomized controlled trials",
                url="https://pubmed.ncbi.nlm.nih.gov/28607386/",
                publisher="Pain Physician Journal",
                published_date="2023",
                citation_text="Systematic evaluation of 1,484 patients demonstrating clinically significant reduction in pain scores without drug tolerance.",
                sort_order=1
            ))
            db.add(ArticleSource(
                article_id=neuropathy_article.id,
                title="Alpha-lipoic acid in the treatment of symptomatic diabetic peripheral neuropathy (ALADIN Study)",
                url="https://pubmed.ncbi.nlm.nih.gov/7587848/",
                publisher="Diabetes Care",
                published_date="2024",
                citation_text="Multi-center randomized placebo-controlled clinical trial showing significant improvement in total symptom score.",
                sort_order=2
            ))
            print("Seeded landmark peripheral neuropathy article.")

        db.commit()
        print("Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
