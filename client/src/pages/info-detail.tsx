import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ChevronLeft, Loader2 } from "lucide-react";
import type { InfoArticle } from "@shared/schema";

export default function InfoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: article, isLoading } = useQuery<InfoArticle>({
    queryKey: ["/api/info-articles", id],
    queryFn: async () => {
      const res = await fetch(`/api/info-articles/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Article introuvable");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f2f2f7" }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-4 sticky top-0 z-10"
        style={{ background: "linear-gradient(90deg, #3db51d 0%, #2a8d13 100%)" }}
      >
        <button
          onClick={() => navigate("/info")}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.2)" }}
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="flex-1 text-center text-white font-bold text-base pr-8 truncate">
          {isLoading ? "Chargement..." : article?.title || "Article"}
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#3db51d" }} />
        </div>
      ) : !article ? (
        <div className="flex justify-center py-20">
          <p className="text-gray-500">Article introuvable.</p>
        </div>
      ) : (
        <div className="pb-10">
          {/* Cover image */}
          <div style={{ height: 260 }}>
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
          </div>

          {/* Title */}
          <div className="px-4 pt-4 pb-3">
            <h2 className="text-gray-900 font-extrabold text-xl leading-tight">{article.title}</h2>
            <p className="text-gray-400 text-xs mt-1">
              {new Date(article.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Divider */}
          <div className="mx-4" style={{ height: 1, background: "#e5e5ea" }} />

          {/* Content */}
          {article.content && (
            <div className="px-4 pt-4">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{article.content}</p>
            </div>
          )}

          {/* Extra images */}
          {article.extraImages && article.extraImages.length > 0 && (
            <div className="px-4 pt-5 space-y-4">
              {article.extraImages.map((img, i) => (
                <div key={i} className="rounded-2xl overflow-hidden shadow-sm">
                  <img src={img} alt={`Image ${i + 1}`} className="w-full object-cover" style={{ maxHeight: 300 }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
