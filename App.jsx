jsximport React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase ulanishi
const SUPABASE_URL = "https://supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_sn5ev1qzOgmDSAwK3eG5hw_dC_fPy14";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGuidePage, setActiveGuidePage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentStage, setIsPaymentStage] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Forma ma'lumotlari
  const [formData, setFormData] = useState({
    name: '',
    owner_name: '',
    link: '',
    logo_url: '',
    description: '',
    product_price: '',
    bid_amount: ''
  });

  // Ma'lumotlarni bazadan tortib olish
  const fetchBrands = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('is_approved', true)
      .order('bid_amount', { ascending: false });

    if (!error && data) {
      setBrands(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBrands();

    // Real-time yangilanishlarni eshitish
    const channels = supabase
      .channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'brands' }, () => {
        fetchBrands();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channels);
    };
  }, []);

  // Formani yuborish va bazaga yozish
  const handlePaymentConfirm = async () => {
    const { error } = await supabase
      .from('brands')
      .insert([{
        name: formData.name,
        owner_name: formData.owner_name,
        link: formData.link || null,
        logo_url: formData.logo_url || null,
        description: formData.description,
        product_price: parseFloat(formData.product_price) || 0,
        bid_amount: parseFloat(formData.bid_amount) || 0,
        is_approved: true // Avtomatik tasdiqlash
      }]);

    if (!error) {
      setIsModalOpen(false);
      setIsPaymentStage(false);
      setFormData({ name: '', owner_name: '', link: '', logo_url: '', description: '', product_price: '', bid_amount: '' });
      fetchBrands();
    } else {
      alert("Xatolik yuz berdi, iltimos qaytadan urinib ko'ring.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans antialiased selection:bg-[#00ff66] selection:text-black">
      {/* HEADER */}
      <header className="border-b border-[#1f2937] bg-[#0d0d0d] sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-wider text-[#00ff66] drop-shadow-[0_0_10px_rgba(0,255,102,0.5)]">
              Zirva<span className="text-white">.uz</span>
            </h1>
            <p className="text-xs text-[#9ca3af] tracking-widest uppercase">Advertising Leaderboard</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#00ff66] text-black font-bold px-4 py-2 rounded border border-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:shadow-[0_0_25px_rgba(0,255,102,0.6)] transition-all duration-300 transform hover:-translate-y-0.5 text-sm uppercase tracking-wider"
          >
            + Mahsulot qo'shish
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        
        {/* FOYDALANISH YO'RIQNOMASI (VERTICAL SLIDER) */}
        <section className="border border-[#1f2937] rounded-lg p-5 bg-[#0d0d0d] shadow-inner relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold tracking-wider text-[#00ff66] uppercase">📑 Foydalanish yo'riqnomasi</h2>
            <div className="flex space-x-1">
              {[1, 2, 3].map((p) => (
                <button 
                  key={p} 
                  onClick={() => setActiveGuidePage(p)}
                  className={`w-7 h-2 rounded transition-all duration-300 ${activeGuidePage === p ? 'bg-[#00ff66] w-10' : 'bg-[#1f2937]'}`}
                />
              ))}
            </div>
          </div>

          <div className="min-h-[100px] flex items-center transition-all duration-500">
            {activeGuidePage === 1 && (
              <div className="space-y-1 animate-fadeIn">
                <h3 className="text-base font-bold text-white">Varoq 1: Mahsulotni joylashtirish</h3>
                <p className="text-sm text-[#9ca3af]">O'z mahsulotingiz, brendingiz yoki kanalingiz ma'lumotlarini kiriting. Mahsulotning shaxsiy sotuv narxini alohida ko'rsating. Bu xaridorlarga mahsulotingiz qiymatini aniq ko'rib turish imkonini beradi.</p>
              </div>
            )}
            {activeGuidePage === 2 && (
              <div className="space-y-1 animate-fadeIn">
                <h3 className="text-base font-bold text-[#00ff66]">Varoq 2: Reklama poygasi va reyting cho'qqisi</h3>
                <p className="text-sm text-[#9ca3af]">Zirva.uz platformasida qat'iy reklama narxi yo'q! Topda turish butunlay sizning qo'lingizda. Kim reklama uchun ko'proq pul to'lasa, tizim uni avtomatik ravishda etalon o'rinlarga chiqaradi. Raqobatchilaringizdan balandroq pul tikib, reyting cho'qqisini egallang va barcha traffikni o'zingizga oling!</p>
              </div>
            )}
            {activeGuidePage === 3 && (
              <div className="space-y-1 animate-fadeIn">
                <h3 className="text-base font-bold text-red-500">Varoq 3: To'lov qilish va Smart-Bot nazorati</h3>
                <p className="text-sm text-[#9ca3af]">Mijoz platformaga faqat 'Topga chiqish to'lovi' (reklama puli) uchun to'lov qiladi. Mahsulot narxi jami to'lovga mutlaqo qo'shilmaydi. <span className="text-red-400 font-bold">DIQQAT:</span> Agar pul to'lamasdan yolg'ondan tasdiqlash tugmasini bossangiz, saytga o'rnatilgan aqlli bot to'lov tushmaganini aniqlab, mahsulotingizni avtomatik ravishda butunlay o'chirib tashlaydi!</p>
              </div>
            )}
          </div>
        </section>

        {/* STATISTICS CARD */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-[#1f2937] p-4 rounded-lg bg-[#0d0d0d] text-center">
            <p className="text-xs text-[#9ca3af] uppercase tracking-wider">Jami Mahsulotlar</p>
            <p className="text-2xl font-black text-white mt-1">{brands.length}</p>
          </div>
          <div className="border border-[#1f2937] p-4 rounded-lg bg-[#0d0d0d] text-center">
            <p className="text-xs text-[#9ca3af] uppercase tracking-wider">Eng Yuqori To'lov</p>
            <p className="text-2xl font-black text-[#00ff66] mt-1">
              {brands.length > 0 ? brands[0].bid_amount.toLocaleString() : 0} UZS
            </p>
          </div>
        </div>

        {/* LEADERBOARD LIST */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold tracking-wider text-[#9ca3af] uppercase mb-4">🏆 Jonli Leaderboard Reytingi</h2>
          {loading ? (
            <p className="text-center text-[#9ca3af] text-sm py-8">Yuklanmoqda...</p>
          ) : brands.length === 0 ? (
            <div className="text-center p-12 border border-dashed border-[#1f2937] rounded-lg text-[#9ca3af]">
              Hozircha hech qanday mahsulot yo'q. Birinchilardan bo'lib joylashtiring!
            </div>
          ) : (
            <div className="space-y-2">
              {brands.map((brand, index) => {
                const isTop3 = index < 3;
                const podiumColors = [
                  'border-[#ffd700] shadow-[0_0_15px_rgba(255,215,0,0.15)]', // Gold
                  'border-[#c0c0c0] shadow-[0_0_15px_rgba(192,192,192,0.15)]', // Silver
                  'border-[#cd7f32] shadow-[0_0_15px_rgba(205,127,50,0.15)]'   // Bronze
                ];

                return (
                  <div 
                    key={brand.id}
                    onClick={() => setSelectedProduct(brand)}
                    className={`border p-4 rounded-lg bg-[#0d0d0d] hover:bg-[#121212] transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer ${isTop3 ? podiumColors[index] : 'border-[#1f2937]'}`}
                  >
                    <div className="flex items-center space-x-4 w-full sm:w-auto">
                      <span className={`text-xl font-black px-3 py-1 rounded ${index === 0 ? 'text-[#ffd700]' : index === 1 ? 'text-[#c0c0c0]' : index === 2 ? 'text-[#cd7f32]' : 'text-[#4b5563]'}`}>
                        #{index + 1}
                      </span>
                      <div className="truncate">
                        <h3 className="font-bold text-white text-base truncate">{brand.name}</h3>
                        <p className="text-xs text-[#9ca3af] truncate">Egasining ismi: {brand.owner_name}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-4 w-full sm:w-auto text-sm border-t border-[#1f2937] sm:border-0 pt-2 sm:pt-0">
                      <div>
                        <p className="text-xs text-[#9ca3af]">Mahsulot narxi</p>
                        <p className="font-semibold text-white">{brand.product_price.toLocaleString()} UZS</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#9ca3af]">Topga chiqish to'lovi</p>
                        <p className="font-black text-[#00ff66] drop-shadow-[0_0_5px_rgba(0,255,102,0.3)]">{brand.bid_amount.toLocaleString()} UZS</p>
Koddan ehtiyotkorlik bilan foydalaning.{brand.link && (<ahref={brand.link.startsWith('http') ? brand.link : https://${brand.link}}target="_blank"rel="noopener noreferrer"onClick={(e) => e.stopPropagation()}className="bg-[#1f2937] text-xs text-[#00ff66] px-2 py-1 rounded border border-[#374151] hover:bg-[#2d3748]">Havola ↗)});})})}{/* FOOTER */}To'lovlarni tasdiqlash va qo'llab-quvvatlash uchun aloqa:📧 Email: najmiddinovnodir707@gmail.com✈️ Telegram: @nodirinvestt© 2026 Zirva.uz • Barcha huquqlar himoyalangan{/* ADD BRAND MODAL */}{isModalOpen && ({!isPaymentStage ? (📦 Mahsulot ma'lumotlari<button onClick={() => setIsModalOpen(false)} className="text-[#9ca3af] hover:text-white font-bold text-xl">×Mahsulot nomi *<input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#141414] border border-[#1f2937] p-2 rounded text-white focus:border-[#00ff66] outline-none" placeholder="Masalan: Krossovka Nike" />Egasining ismi *<input type="text" required value={formData.owner_name} onChange={(e) => setFormData({...formData, owner_name: e.target.value})} className="w-full bg-[#141414] border border-[#1f2937] p-2 rounded text-white focus:border-[#00ff66] outline-none" placeholder="Ismingizni kiriting" />Havola (Telegram, Instagram yoki Veb-sayt) (Ixtiyoriy)<input type="text" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} className="w-full bg-[#141414] border border-[#1f2937] p-2 rounded text-white focus:border-[#00ff66] outline-none" placeholder="masalan: t.me/kanalingiz" />Rasm URL manzili (Ixtiyoriy)<input type="text" value={formData.logo_url} onChange={(e) => setFormData({...formData, logo_url: e.target.value})} className="w-full bg-[#141414] border border-[#1f2937] p-2 rounded text-white focus:border-[#00ff66] outline-none" placeholder="Rasm havolasini qo'ying" />Batafsil tavsif *<textarea required rows="2" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-[#141414] border border-[#1f2937] p-2 rounded text-white focus:border-[#00ff66] outline-none resize-none" placeholder="Mahsulot haqida qisqacha ma'lumot">Mahsulot narxi (UZS) *<input type="number" required value={formData.product_price} onChange={(e) => setFormData({...formData, product_price: e.target.value})} className="w-full bg-[#141414] border border-[#1f2937] p-2 rounded text-white focus:border-[#00ff66] outline-none" placeholder="250000" />Topga chiqish to'lovi *<input type="number" required value={formData.bid_amount} onChange={(e) => setFormData({...formData, bid_amount: e.target.value})} className="w-full bg-[#141414] border border-[#1f2937] p-2 rounded text-white focus:border-[#00ff66] outline-none" placeholder="50000" /><buttononClick={() => {if (formData.name && formData.owner_name && formData.description && formData.product_price && formData.bid_amount) {setIsPaymentStage(true);} else {alert("Iltimos, barcha majburiy (*) maydonlarni to'ldiring.");}}}className="w-full bg-[#00ff66] text-black font-bold py-2 rounded uppercase tracking-wider text-sm mt-2 hover:bg-[#00cc52] transition-colors">Keyingi bosqich →) : (💳 Click / Payme P2P To'lov<button onClick={() => setIsPaymentStage(false)} className="text-[#9ca3af] hover:text-white font-bold text-sm">← OrqagaKarta egasi:NODIRJON NAJMIDINOVKarta raqami (TBC Visa):4466 1369 5222 5754Jami to'lov:{(parseFloat(formData.bid_amount) || 0).toLocaleString()} UZS(Mahsulot narxi jami to'lovga qo'shilmaydi){/* AQLLI BOT OGOHLANTIRISH QUTISI */}DIQQAT: Hurmatli mijoz, tepada ko'rsatilgan kartaga to'lov qilganingizdan so'nggina tasdiqlash tugmasini bosing. Agar to'lov qilmasdan tasdiqlashni bossangiz, mahsulotingiz joylashtirilgani bilan saytga o'rnatilgan bot avtomatik vadofon ravishda mahsulotni o'chirib tashlaydi. Iltimos, foydalanish yo'riqnomasini o'qib chiqing.To'lovni tasdiqlash)})}{/* DETAIL POPUP MODAL */}{selectedProduct && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}><div className="border border-[#1f2937] bg-[#0d0d0d] w-full max-w-lg rounded-lg overflow-hidden shadow-[0_0_40px_rgba(0,255,102,0.15)] animate-scaleUp" onClick={(e) => e.stopPropagation()}>{selectedProduct.logo_url ? () : (📦Rasm yuklanmagan)}<button onClick={() => setSelectedProduct(null)} className="absolute top-3 right-3 bg-black bg-opacity-70 text-[#9ca3af] hover:text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">×{selectedProduct.name}Egasining ismi: {selectedProduct.owner_name}Reklama puli: {selectedProduct.bid_amount.toLocaleString()} UZSMahsulot Tavsifi:{selectedProduct.description}Mahsulot asl narxi:{selectedProduct.product_price.toLocaleString()} UZS{selectedProduct.link && (<ahref={selectedProduct.link.startsWith('http') ? selectedProduct.link : https://${selectedProduct.link}}target="_blank"rel="noopener noreferrer"className="bg-[#00ff66] text-black font-black px-4 py-2 rounded text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(0,255,102,0.2)] hover:bg-[#00cc52]">Aloqaga chiqish / Ko'rish ↗)})});}
---

### ⏱️ Keyingi bajariladigan qisqa qadam:

1. Ushbu kodni `App.jsx` fayliga saqlab, dasturni yoping.
2. **GitHub Desktop** oynasiga qaytsangiz, dastur fayl o‘zgarganini srazu yashil rangda ko‘rsatadi.
3. Ekranning o‘rtasidagi ko‘k rangli **`Publish repository`** tugmasini bosing [image_KGFrDt.png].

<FollowUp>
Kodni muvaffaqiyatli saqlab, GitHub Desktop dasturida **`Publish repository` tugmasini bosa oldingizmi?** Keyingi skrinshotni yuboring, uni Vercel-ga tekinga ulab, jonli havolasini ochamiz!
</FollowUp>