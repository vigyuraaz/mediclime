import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Breadcrumbs from '../components/Breadcrumbs';
import { LoadingSkeleton } from '../components/Feedback';
import { getPublicAuthors, getPublicAuthorBySlug } from '../api/publicData';

export function AuthorsPage() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPublicAuthors();
        setAuthors(data || []);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <Helmet>
        <title>Medical Advisory Board & Clinical Authors | Mediclime</title>
        <meta name="description" content="Meet the practicing physicians, neurologists, pharmacologists, and registered dietitians who write and peer-review all medical guides on Mediclime." />
        <meta name="keywords" content="medical advisory board, clinical authors, medical reviewers, board-certified doctors, clinical pharmacologists" />
        <meta property="og:title" content="Medical Advisory Board & Clinical Authors | Mediclime" />
        <meta property="og:description" content="Meet the practicing physicians, neurologists, pharmacologists, and registered dietitians who write and peer-review all medical guides on Mediclime." />
      </Helmet>

      <Breadcrumbs items={[{ label: 'Medical Advisory Board', path: '/authors' }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F43F5E]">
            Clinical Review Board
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#094749] tracking-tight font-sans mt-2 mb-3">
            Our Physicians & Clinical Researchers
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-serif italic">
            Every clinical guide and supplement analysis published by Mediclime undergoes rigorous editorial review by board-certified physicians, pharmacologists, and clinical dietitians.
          </p>
        </div>

        {loading ? (
          <LoadingSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {authors.map((auth) => (
              <div key={auth.id} className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-6 items-start hover:border-teal-300 transition-all card-hover">
                <img
                  src={auth.profile_image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"}
                  alt={auth.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-teal-600/20 shrink-0"
                />
                <div className="space-y-3 flex-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900 font-sans">
                        <Link to={`/authors/${auth.slug}`} className="hover:text-[#0F6265]">
                          {auth.name}
                        </Link>
                      </h3>
                      {auth.is_medical_reviewer && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-[#0F6265] border border-teal-200">
                          Medical Reviewer
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-teal-800 mt-0.5">
                      {auth.professional_title}
                    </p>
                  </div>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                    {auth.short_bio}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {(auth.areas_of_expertise || []).map((exp, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export function AuthorDetailPage() {
  const { slug } = useParams();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getPublicAuthorBySlug(slug);
        setAuthor(data);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) return <LoadingSkeleton count={2} />;

  if (!author) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Physician Profile Not Found</h2>
        <Link to="/authors" className="px-5 py-2.5 rounded-xl bg-[#0F6265] text-white font-bold text-xs">
          Return to Advisory Board
        </Link>
      </div>
    );
  }

  const pageTitle = `${author.name} (${author.professional_title}) | Mediclime Editorial Board`;
  const pageDesc = author.bio || `Explore the medical background, credentials, and published clinical guides authored or reviewed by ${author.name} on Mediclime.`;
  const pageKeywords = `${author.name}, ${author.professional_title}, ${(author.areas_of_expertise || []).join(', ')}, clinical author, medical reviewer`;

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="keywords" content={pageKeywords} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
      </Helmet>

      <Breadcrumbs items={[{ label: 'Advisory Board', path: '/authors' }, { label: author.name }]} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        <div className="flex flex-col sm:flex-row gap-8 items-start pb-8 border-b border-slate-200">
          <img
            src={author.profile_image}
            alt={author.name}
            className="w-32 h-32 rounded-3xl object-cover border-4 border-teal-600/15 shadow-md shrink-0"
          />
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#094749] tracking-tight font-sans">
              {author.name}
            </h1>
            <p className="text-base text-teal-800 font-bold">
              {author.professional_title} {author.credentials && `(${author.credentials})`}
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              {author.full_bio || author.short_bio}
            </p>
          </div>
        </div>

        {/* Clinical Affiliations */}
        {author.hospital_affiliations && author.hospital_affiliations.length > 0 && (
          <div className="p-6 rounded-2xl bg-teal-50/60 border border-teal-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-2">
              Hospital & Institutional Affiliations
            </h3>
            <ul className="space-y-1 text-xs sm:text-sm text-slate-700">
              {author.hospital_affiliations.map((aff, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">•</span>
                  <span>{aff}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
