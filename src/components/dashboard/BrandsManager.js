"use client";
import { useEffect, useState, useRef } from "react";
import Icon from "@/components/ui/Icon";
import { apiFetch } from "@/lib/apiClient";
import { useToast } from "@/components/ui/Toast";
import { SkeletonCard } from "@/components/ui/Skeleton";

export default function BrandsManager() {
  const { toast } = useToast();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [expandedBrand, setExpandedBrand] = useState(null);
  const [brandProducts, setBrandProducts] = useState({});
  const [productsLoading, setProductsLoading] = useState(null);

  const [form, setForm] = useState({
    name: "",
    country: "",
    website: "",
    description: "",
    logoUrl: "",
    isActive: true,
    sortOrder: 0,
  });

  const fileInputRef = useRef(null);

  async function loadBrands() {
    setLoading(true);
    try {
      const res = await apiFetch("/api/brands?withProducts=true&all=true");
      const data = await res.json();
      // API only returns active brands; for admin we need all
      // We'll fetch all via a separate call if needed, but the API returns active only
      setBrands(data.brands || []);
    } catch (err) {
      toast.error("Brendlər yüklənmədi");
    }
    setLoading(false);
  }

  useEffect(() => { loadBrands(); }, []);

  async function loadBrandProducts(brandId) {
    setProductsLoading(brandId);
    try {
      const res = await apiFetch(`/api/brands/${brandId}`);
      const data = await res.json();
      setBrandProducts(prev => ({ ...prev, [brandId]: data.brand?.products || [] }));
    } catch {
      toast.error("Məhsullar yüklənmədi");
    }
    setProductsLoading(null);
  }

  function toggleExpand(brandId) {
    if (expandedBrand === brandId) {
      setExpandedBrand(null);
    } else {
      setExpandedBrand(brandId);
      if (!brandProducts[brandId]) {
        loadBrandProducts(brandId);
      }
    }
  }

  function resetForm() {
    setForm({ name: "", country: "", website: "", description: "", logoUrl: "", isActive: true, sortOrder: 0 });
    setEditingBrand(null);
    setShowForm(false);
  }

  function startEdit(brand) {
    setForm({
      name: brand.name || "",
      country: brand.country || "",
      website: brand.website || "",
      description: brand.description || "",
      logoUrl: brand.logoUrl || "",
      isActive: brand.isActive !== false,
      sortOrder: brand.sortOrder || 0,
    });
    setEditingBrand(brand);
    setShowForm(true);
  }

  async function handleUploadLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Maksimum 5MB");
      return;
    }
    const formData = new FormData();
    formData.append("files", file);
    try {
      const res = await apiFetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      const url = data.url || data.images?.[0]?.url;
      if (url) {
        setForm(prev => ({ ...prev, logoUrl: url }));
        toast.success("Şəkil yükləndi");
      } else {
        toast.error("Şəkil yüklənmədi");
      }
    } catch {
      toast.error("Yükləmə xətası");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Brend adı tələb olunur");
      return;
    }
    try {
      if (editingBrand) {
        const res = await apiFetch(`/api/brands/${editingBrand.id}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
        if (res.ok) {
          toast.success("Brend yeniləndi");
          resetForm();
          loadBrands();
        } else {
          const err = await res.json();
          toast.error(err.error || "Xəta");
        }
      } else {
        const res = await apiFetch("/api/brands", {
          method: "POST",
          body: JSON.stringify(form),
        });
        if (res.ok) {
          toast.success("Brend əlavə edildi");
          resetForm();
          loadBrands();
        } else {
          const err = await res.json();
          toast.error(err.error || "Xəta");
        }
      }
    } catch {
      toast.error("Əməliyyat xətası");
    }
  }

  async function handleDelete(brand) {
    if (!confirm(`"${brand.name}" brendini silmək istədiyinizə əminsiniz?`)) return;
    try {
      const res = await apiFetch(`/api/brands/${brand.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Brend silindi");
        loadBrands();
      } else {
        const err = await res.json();
        toast.error(err.error || "Silinmədi");
      }
    } catch {
      toast.error("Əməliyyat xətası");
    }
  }

  async function toggleActive(brand) {
    try {
      const res = await apiFetch(`/api/brands/${brand.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !brand.isActive }),
      });
      if (res.ok) {
        toast.success(brand.isActive ? "Brend deaktiv edildi" : "Brend aktiv edildi");
        loadBrands();
      }
    } catch {
      toast.error("Xəta");
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Icon name="award" size={20} /> Brendlər
        </h2>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <Icon name="plus" size={16} /> Yeni Brend
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-800">
              {editingBrand ? "Brendi Redaktə Et" : "Yeni Brend Əlavə Et"}
            </h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-700">
              <Icon name="close" size={18} />
            </button>
          </div>

          {/* Logo upload */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-400 flex items-center justify-center cursor-pointer overflow-hidden shrink-0 bg-gray-50"
            >
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Icon name="image" size={24} className="text-gray-300" />
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-brand-600 font-medium hover:text-brand-700"
              >
                {form.logoUrl ? "Loqonu dəyiş" : "Loqo yüklə"}
              </button>
              {form.logoUrl && (
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, logoUrl: "" }))}
                  className="ml-3 text-sm text-red-500 hover:text-red-700"
                >
                  Sil
                </button>
              )}
              <p className="text-xs text-gray-400 mt-1">JPG, PNG · maks 5MB</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadLogo} className="hidden" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Brend Adı *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-400 focus:outline-none"
                placeholder="Məs: Syngenta"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">İstehsalçı Ölkə</label>
              <input
                type="text"
                value={form.country}
                onChange={e => setForm(prev => ({ ...prev, country: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-400 focus:outline-none"
                placeholder="Məs: İsveçrə"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Vebsayt</label>
              <input
                type="text"
                value={form.website}
                onChange={e => setForm(prev => ({ ...prev, website: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-400 focus:outline-none"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Sıra Nömrəsi</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={e => setForm(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Təsvir</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-400 focus:outline-none"
              placeholder="Brend haqqında məlumat..."
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-400"
            />
            <span className="text-gray-700">Aktiv (saytda görünür)</span>
          </label>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
            >
              {editingBrand ? "Yadda Saxla" : "Əlavə Et"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              Ləğv Et
            </button>
          </div>
        </form>
      )}

      {/* Brands List */}
      {loading ? (
        <SkeletonCard />
      ) : brands.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Icon name="award" size={40} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Hələ brend əlavə edilməyib</p>
        </div>
      ) : (
        <div className="space-y-3">
          {brands.map(brand => (
            <div key={brand.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Brand Row */}
              <div className="flex items-center gap-3 p-4">
                {/* Logo */}
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {brand.logoUrl ? (
                    <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-lg font-bold text-gray-300">{brand.name?.[0]?.toUpperCase()}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">{brand.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${brand.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {brand.isActive ? "Aktiv" : "Deaktiv"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                    {brand.country && <span className="flex items-center gap-1"><Icon name="mapPin" size={12} />{brand.country}</span>}
                    {brand.website && <span className="flex items-center gap-1 truncate"><Icon name="link" size={12} />{brand.website}</span>}
                    {brand._count?.products != null && (
                      <span className="flex items-center gap-1"><Icon name="package" size={12} />{brand._count.products} məhsul</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleExpand(brand.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                    title="Məhsulları göstər"
                  >
                    <Icon name={expandedBrand === brand.id ? "chevronUp" : "chevronDown"} size={16} />
                  </button>
                  <button
                    onClick={() => startEdit(brand)}
                    className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition"
                    title="Redaktə"
                  >
                    <Icon name="edit" size={16} />
                  </button>
                  <button
                    onClick={() => toggleActive(brand)}
                    className="p-2 rounded-lg hover:bg-amber-50 text-gray-500 hover:text-amber-600 transition"
                    title={brand.isActive ? "Deaktiv et" : "Aktiv et"}
                  >
                    <Icon name={brand.isActive ? "eyeOff" : "eye"} size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(brand)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition"
                    title="Sil"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </div>

              {/* Expanded: Products */}
              {expandedBrand === brand.id && (
                <div className="border-t border-gray-50 bg-gray-50/50 p-4">
                  {productsLoading === brand.id ? (
                    <div className="text-center py-4 text-sm text-gray-400">Məhsullar yüklənir...</div>
                  ) : (brandProducts[brand.id] || []).length === 0 ? (
                    <div className="text-center py-4 text-sm text-gray-400">
                      <Icon name="package" size={24} className="mx-auto mb-1 text-gray-300" />
                      Bu brendə aid aktiv məhsul yoxdur
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Bu brendə aid məhsullar ({brandProducts[brand.id].length}):
                      </p>
                      {brandProducts[brand.id].map(p => (
                        <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-gray-100">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                            {p.images?.[0]?.url ? (
                              <img src={p.images[0].url} alt={p.titleAz} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Icon name="image" size={14} className="text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{p.titleAz}</p>
                            <p className="text-xs text-gray-500">
                              ₼{Number(p.price).toLocaleString("az-AZ")} · {p.unit || "ədəd"}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {p.status === "ACTIVE" ? "Aktiv" : p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
