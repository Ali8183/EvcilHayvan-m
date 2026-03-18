import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { TamagotchiContext } from '../context/TamagotchiContext';

const windowWidth = Dimensions.get('window').width;

// --- REUSABLE GAME OVER UI ---
const GameOverOverlay = ({ odul, onTekrarOyna, onMenuyeDon }) => {
   return (
      <View style={styles.gameOverOverlay}>
         <View style={styles.gameOverCard}>
            <Text style={styles.gameOverEmoji}>{odul.mutluluk >= 0 ? '🎉' : '🥺'}</Text>
            <Text style={styles.gameOverTitle}>Oyun Bitti!</Text>
            
            <View style={styles.rewardsContainer}>
               {odul.altin > 0 && <Text style={styles.rewardText}>+{odul.altin} 🪙 Altın</Text>}
               {odul.xp > 0 && <Text style={styles.rewardText}>+{odul.xp} 🌟 XP</Text>}
               {odul.mutluluk > 0 && <Text style={styles.rewardText}>+{odul.mutluluk} 😊 Mutluluk</Text>}
               {odul.mutluluk < 0 && <Text style={[styles.rewardText, { color: '#d63031' }]}>{odul.mutluluk} 🥺 Mutluluk</Text>}
            </View>

            <View style={styles.gameOverButtons}>
               <TouchableOpacity style={[styles.goBtn, styles.goBtnAgain]} onPress={onTekrarOyna} activeOpacity={0.8}>
                  <Text style={styles.goBtnText}>🔄 Tekrar Oyna</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.goBtn, styles.goBtnMenu]} onPress={onMenuyeDon} activeOpacity={0.8}>
                  <Text style={styles.goBtnText}>🔙 Menüye Dön</Text>
               </TouchableOpacity>
            </View>
         </View>
      </View>
   );
};


// --- OYUN 1: TAP TAP CATCHER ---
const TapTapGame = ({ onMenuCikisi, oyunSessizOdulVer, isDarkMode }) => {
  const [oyunAktif, setOyunAktif] = useState(false);
  const [oyunBitti, setOyunBitti] = useState(false);
  const [kazanilanOdul, setKazanilanOdul] = useState({ altin: 0, xp: 0, mutluluk: 0 });
  const [puan, setPuan] = useState(0);
  const [kalanSure, setKalanSure] = useState(10);
  const [hedefPos, setHedefPos] = useState({ top: '50%', left: '50%' });

  useEffect(() => {
    let timer = null;
    if (oyunAktif && kalanSure > 0) {
      timer = setInterval(() => setKalanSure((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [oyunAktif, kalanSure]);

  useEffect(() => {
    if (kalanSure <= 0 && oyunAktif) {
      setOyunAktif(false);
      let kMutluluk = puan;
      let kXp = puan * 2;
      let kAltin = Math.max(5, puan);
      if (puan === 0) {
         kMutluluk = -10; kXp = 0; kAltin = 0;
      }
      setKazanilanOdul({ mutluluk: kMutluluk, xp: kXp, altin: kAltin });
      setOyunBitti(true);
    }
  }, [kalanSure, oyunAktif, puan]);

  const oyunaBasla = () => {
    setPuan(0);
    setKalanSure(10);
    setOyunBitti(false);
    setOyunAktif(true);
    hedefYerDegistir();
  };

  const handleTekrarOyna = () => {
    oyunSessizOdulVer(kazanilanOdul.mutluluk, kazanilanOdul.xp, kazanilanOdul.altin);
    oyunaBasla();
  };

  const handleMenuyeDon = () => {
    oyunSessizOdulVer(kazanilanOdul.mutluluk, kazanilanOdul.xp, kazanilanOdul.altin);
    onMenuCikisi();
  };

  const hedefYerDegistir = () => {
    const minTop = 15; const maxTop = 85;
    const minLeft = 10; const maxLeft = 85;
    const randomTop = Math.floor(Math.random() * (maxTop - minTop + 1) + minTop);
    const randomLeft = Math.floor(Math.random() * (maxLeft - minLeft + 1) + minLeft);
    setHedefPos({ top: `${randomTop}%`, left: `${randomLeft}%` });
  };

  const hedefeCek = () => {
    if (oyunAktif) {
      setPuan((prev) => prev + 1);
      hedefYerDegistir();
    }
  };

  return (
    <View style={[styles.gameContainer, isDarkMode && { backgroundColor: '#121212' }]}>
      {oyunBitti ? (
         <GameOverOverlay odul={kazanilanOdul} onTekrarOyna={handleTekrarOyna} onMenuyeDon={handleMenuyeDon} />
      ) : !oyunAktif ? (
        <View style={styles.startContainer}>
          <Text style={[styles.title, isDarkMode && { color: '#ffffff' }]}>Tap-Tap Catcher 🎮</Text>
          <Text style={[styles.desc, isDarkMode && { color: '#b2bec3' }]}>10 saniye boyunca ekranda beliren hedefi olabildiğince hızlı yakala!</Text>
          <TouchableOpacity style={styles.startButton} onPress={oyunaBasla} activeOpacity={0.8}>
            <Text style={styles.startButtonText}>Başla</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.gameArea, isDarkMode && { backgroundColor: '#1e1e1e' }]}>
          <View style={[styles.header, isDarkMode && { backgroundColor: '#121212' }]}>
             <Text style={styles.scoreText}>Skor: {puan}</Text>
             <Text style={styles.timeText}>Süre: {kalanSure}s</Text>
          </View>
          <TouchableOpacity style={[styles.target, { top: hedefPos.top, left: hedefPos.left }]} onPress={hedefeCek} activeOpacity={0.6}>
             <Text style={styles.targetEmoji}>🧶</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// --- OYUN 2: HAFIZA KARTLARI (Memory Match) ---
const EMOJILER = ['🍎', '🦴', '🧶', '⚽'];
const MAKS_KART = 8; 

const HafizaOyunu = ({ onMenuCikisi, oyunSessizOdulVer, isDarkMode }) => {
   const [kartlar, setKartlar] = useState([]);
   const [secilenler, setSecilenler] = useState([]);
   const [eslesenler, setEslesenler] = useState([]);
   const [oyunAktif, setOyunAktif] = useState(false);
   const [oyunBitti, setOyunBitti] = useState(false);
   const [kazanilanOdul, setKazanilanOdul] = useState({ altin: 0, xp: 0, mutluluk: 0 });
   const [hamle, setHamle] = useState(0);

   const oyunaBasla = () => {
      const ciftler = [...EMOJILER, ...EMOJILER];
      for (let i = ciftler.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [ciftler[i], ciftler[j]] = [ciftler[j], ciftler[i]];
      }
      setKartlar(ciftler.map((emoji, index) => ({ id: index, emoji })));
      setSecilenler([]);
      setEslesenler([]);
      setHamle(0);
      setOyunBitti(false);
      setOyunAktif(true);
   };

   useEffect(() => {
     if (secilenler.length === 2) {
       const [sec1, sec2] = secilenler;
       setHamle(prev => prev + 1);
       if (kartlar[sec1].emoji === kartlar[sec2].emoji) {
         setEslesenler(prev => [...prev, sec1, sec2]);
         setSecilenler([]);
       } else {
         setTimeout(() => {
           setSecilenler([]);
         }, 1000);
       }
     }
   }, [secilenler]);

   useEffect(() => {
      if (oyunAktif && eslesenler.length === MAKS_KART) {
         setOyunAktif(false);
         // Yarım saniye bekleyip sonucu göster
         setTimeout(() => {
            const gercekHamle = Number(hamle) || 10;
            const kazanilanPuan = gercekHamle <= 12 ? 15 : 10; 
            
            setKazanilanOdul({
                mutluluk: kazanilanPuan,
                xp: kazanilanPuan * 2,
                altin: Math.max(5, kazanilanPuan)
            });
            setOyunBitti(true);
         }, 500);
      }
   }, [eslesenler, oyunAktif]);

   const handleTekrarOyna = () => {
    oyunSessizOdulVer(kazanilanOdul.mutluluk, kazanilanOdul.xp, kazanilanOdul.altin);
    oyunaBasla();
   };

   const handleMenuyeDon = () => {
    oyunSessizOdulVer(kazanilanOdul.mutluluk, kazanilanOdul.xp, kazanilanOdul.altin);
    onMenuCikisi();
   };

   const kartSec = (index) => {
      if (secilenler.length < 2 && !secilenler.includes(index) && !eslesenler.includes(index)) {
         setSecilenler(prev => [...prev, index]);
      }
   };

   return (
    <View style={[styles.gameContainer, isDarkMode && { backgroundColor: '#121212' }]}>
       {oyunBitti ? (
          <GameOverOverlay odul={kazanilanOdul} onTekrarOyna={handleTekrarOyna} onMenuyeDon={handleMenuyeDon} />
       ) : !oyunAktif ? (
         <View style={styles.startContainer}>
           <Text style={[styles.title, isDarkMode && { color: '#ffffff' }]}>Hafıza Kartları 🃏</Text>
           <Text style={[styles.desc, isDarkMode && { color: '#b2bec3' }]}>Aynı olan çiftleri bul! En az hamleyle bitirmeye çalış.</Text>
           <TouchableOpacity style={[styles.startButton, {backgroundColor: '#e84393'}]} onPress={oyunaBasla} activeOpacity={0.8}>
             <Text style={styles.startButtonText}>Başla</Text>
           </TouchableOpacity>
         </View>
       ) : (
         <ScrollView style={[styles.memoryArea, isDarkMode && { backgroundColor: '#1e1e1e' }]} contentContainerStyle={{ paddingBottom: 150, paddingTop: 50, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
             <Text style={[styles.hamleText, isDarkMode && { color: '#ffffff' }]}>Yapılan Hamle: {hamle}</Text>
             <View style={styles.gridContainer}>
                {kartlar && kartlar.length > 0 && kartlar.map((kart, index) => {
                   const acikMi = secilenler.includes(index) || eslesenler.includes(index);
                   return (
                      <TouchableOpacity 
                         key={kart?.id ?? index} 
                         style={[styles.memoryCard, acikMi ? styles.memoryCardAcik : styles.memoryCardKapali]}
                         onPress={() => kartSec(index)}
                         activeOpacity={0.8}
                      >
                         <Text style={styles.memoryEmoji}>{acikMi ? kart.emoji : '❓'}</Text>
                      </TouchableOpacity>
                   );
                })}
             </View>
         </ScrollView>
       )}
    </View>
   );
};

// --- OYUN 3: HIZLI MATEMATİK ---
const MatematikOyunu = ({ onMenuCikisi, oyunSessizOdulVer, isDarkMode }) => {
   const [oyunAktif, setOyunAktif] = useState(false);
   const [oyunBitti, setOyunBitti] = useState(false);
   const [kazanilanOdul, setKazanilanOdul] = useState({ altin: 0, xp: 0, mutluluk: 0 });
   const [kalanSure, setKalanSure] = useState(15);
   const [skor, setSkor] = useState(0);
   const [soru, setSoru] = useState({ metin: '', cevap: 0, siklar: [] });

   useEffect(() => {
      let timer = null;
      if (oyunAktif && kalanSure > 0) {
        timer = setInterval(() => setKalanSure(prev => prev - 1), 1000);
      }
      return () => clearInterval(timer);
   }, [oyunAktif, kalanSure]);

   useEffect(() => {
      if (kalanSure <= 0 && oyunAktif) {
        setOyunAktif(false);
        const calcSkor = skor * 4;
        let kMutluluk = calcSkor;
        let kXp = calcSkor * 2;
        let kAltin = Math.max(5, calcSkor);
        if (skor === 0) {
           kMutluluk = -10; kXp = 0; kAltin = 0;
        }
        setKazanilanOdul({ mutluluk: kMutluluk, xp: kXp, altin: kAltin });
        setOyunBitti(true);
      }
   }, [kalanSure, oyunAktif, skor]);

   const sayiUret = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

   const soruOlustur = () => {
      const isAddition = Math.random() > 0.5;
      const sayi1 = sayiUret(1, 20);
      const sayi2 = sayiUret(1, 20);
      let dogruCevap = 0; let soruMetni = '';

      if (isAddition) {
         soruMetni = `${sayi1} + ${sayi2} = ?`; dogruCevap = sayi1 + sayi2;
      } else {
         const buyuk = Math.max(sayi1, sayi2); const kucuk = Math.min(sayi1, sayi2);
         soruMetni = `${buyuk} - ${kucuk} = ?`; dogruCevap = buyuk - kucuk;
      }

      let yanlis1 = dogruCevap + sayiUret(1, 4) * (Math.random() > 0.5 ? 1 : -1);
      let yanlis2 = dogruCevap + sayiUret(1, 5) * (Math.random() > 0.5 ? 1 : -1);
      if(yanlis1 === dogruCevap) yanlis1 += 1;
      if(yanlis2 === dogruCevap || yanlis2 === yanlis1) yanlis2 -= 2;

      const tumSiklar = [dogruCevap, yanlis1, yanlis2].sort(() => Math.random() - 0.5);
      setSoru({ metin: soruMetni, cevap: dogruCevap, siklar: tumSiklar });
   };

   const oyunaBasla = () => {
      setSkor(0);
      setKalanSure(15);
      setOyunBitti(false);
      setOyunAktif(true);
      soruOlustur();
   };

   const cevapKontrol = (secim) => {
      if (secim === soru.cevap) {
         setSkor(prev => prev + 1);
         soruOlustur();
      } else {
         setKalanSure(prev => Math.max(0, prev - 2)); 
      }
   };

   const handleTekrarOyna = () => {
      oyunSessizOdulVer(kazanilanOdul.mutluluk, kazanilanOdul.xp, kazanilanOdul.altin);
      oyunaBasla();
   };
  
   const handleMenuyeDon = () => {
      oyunSessizOdulVer(kazanilanOdul.mutluluk, kazanilanOdul.xp, kazanilanOdul.altin);
      onMenuCikisi();
   };

   return (
      <View style={[styles.gameContainer, isDarkMode && { backgroundColor: '#121212' }]}>
         {oyunBitti ? (
            <GameOverOverlay odul={kazanilanOdul} onTekrarOyna={handleTekrarOyna} onMenuyeDon={handleMenuyeDon} />
         ) : !oyunAktif ? (
           <View style={styles.startContainer}>
             <Text style={[styles.title, isDarkMode && { color: '#ffffff' }]}>Hızlı Matematik 🧠</Text>
             <Text style={[styles.desc, isDarkMode && { color: '#b2bec3' }]}>15 saniye içinde en fazla doğru veya eksi işlemini çöz. (Yanlış cevap süreni 2sn kısaltır!)</Text>
             <TouchableOpacity style={[styles.startButton, {backgroundColor: '#8e44ad'}]} onPress={oyunaBasla} activeOpacity={0.8}>
               <Text style={styles.startButtonText}>Başla</Text>
             </TouchableOpacity>
           </View>
         ) : (
           <View style={[styles.mathArea, isDarkMode && { backgroundColor: '#1e1e1e' }]}>
              <View style={styles.mathHeader}>
                 <Text style={styles.scoreText}>Doğru: {skor}</Text>
                 <Text style={[styles.timeText, kalanSure <= 5 && {color: 'red'}]}>Süre: {kalanSure}s</Text>
              </View>
              <View style={styles.soruKutusu}>
                 <Text style={styles.soruText}>{soru.metin}</Text>
              </View>
              <View style={styles.siklarContainer}>
                 {soru.siklar.map((secim, idx) => (
                    <TouchableOpacity key={idx} style={styles.sikBtn} onPress={() => cevapKontrol(secim)} activeOpacity={0.7}>
                       <Text style={styles.sikText}>{secim}</Text>
                    </TouchableOpacity>
                 ))}
              </View>
           </View>
         )}
      </View>
     );
};


// --- OYUN 4: TAŞ KAĞIT MAKAS ---
const TasKagitMakasOyunu = ({ onMenuCikisi, oyunSessizOdulVer, isDarkMode }) => {
   const [oyunBitti, setOyunBitti] = useState(false);
   const [oyunAktif, setOyunAktif] = useState(false);
   const [kazanilanOdul, setKazanilanOdul] = useState({ altin: 0, xp: 0, mutluluk: 0 });
   const [sonuc, setSonuc] = useState(null); 
   const [secimler, setSecimler] = useState({ user: null, pc: null });

   const eylemler = [{id: 'tas', emoji: '✊'}, {id: 'kagit', emoji: '✋'}, {id: 'makas', emoji: '✌️'}];

   const oyunaBasla = () => {
      setSonuc(null);
      setSecimler({ user: null, pc: null });
      setOyunBitti(false);
      setOyunAktif(true);
   };

   const handleSecim = (userSecim) => {
      if (sonuc) return;
      const pcSecim = eylemler[Math.floor(Math.random() * eylemler.length)].id;
      setSecimler({ user: userSecim, pc: pcSecim });
      
      let res = 'kaybettin';
      if (userSecim === pcSecim) { res = 'berabere'; }
      else if ((userSecim === 'tas' && pcSecim === 'makas') || 
               (userSecim === 'kagit' && pcSecim === 'tas') || 
               (userSecim === 'makas' && pcSecim === 'kagit')) { 
         res = 'kazandin'; 
      }
      
      setSonuc(res);
      setTimeout(() => {
         if (res === 'kazandin') {
            setKazanilanOdul({ mutluluk: 15, xp: 30, altin: 20 });
         } else if (res === 'berabere') {
            setKazanilanOdul({ mutluluk: 5, xp: 0, altin: 0 });
         } else {
            setKazanilanOdul({ mutluluk: -5, xp: 0, altin: 0 });
         }
         setOyunAktif(false);
         setOyunBitti(true);
      }, 1500);
   };

   const handleTekrarOyna = () => { oyunSessizOdulVer(kazanilanOdul.mutluluk, kazanilanOdul.xp, kazanilanOdul.altin); oyunaBasla(); };
   const handleMenuyeDon = () => { oyunSessizOdulVer(kazanilanOdul.mutluluk, kazanilanOdul.xp, kazanilanOdul.altin); onMenuCikisi(); };

   return (
      <View style={[styles.gameContainer, isDarkMode && { backgroundColor: '#121212' }]}>
         {oyunBitti ? <GameOverOverlay odul={kazanilanOdul} onTekrarOyna={handleTekrarOyna} onMenuyeDon={handleMenuyeDon} />
         : !oyunAktif ? (
            <View style={styles.startContainer}>
               <Text style={[styles.title, isDarkMode && { color: '#ffffff' }]}>Taş Kağıt Makas ✊✋✌️</Text>
               <Text style={[styles.desc, isDarkMode && { color: '#b2bec3' }]}>Rakibini yen, 20 Altın ve 30 XP kazan!</Text>
               <TouchableOpacity style={[styles.startButton, {backgroundColor: '#f39c12'}]} onPress={oyunaBasla} activeOpacity={0.8}>
                  <Text style={styles.startButtonText}>Başla</Text>
               </TouchableOpacity>
            </View>
         ) : (
            <View style={styles.rpsArea}>
               {sonuc ? (
                  <View style={styles.rpsResult}>
                     <Text style={styles.rpsResultTitle}>{sonuc === 'kazandin' ? '🥇 Kazandın!' : sonuc === 'berabere' ? '🤝 Berabere' : '💀 Kaybettin'}</Text>
                     <View style={styles.rpsMatch}>
                        <Text style={styles.rpsEmoji}>{eylemler.find(e => e.id === secimler.user)?.emoji}</Text>
                        <Text style={styles.rpsVs}>VS</Text>
                        <Text style={styles.rpsEmoji}>{eylemler.find(e => e.id === secimler.pc)?.emoji}</Text>
                     </View>
                  </View>
               ) : (
                  <View style={styles.rpsChoices}>
                     <Text style={styles.rpsChooseTitle}>Seçimini Yap!</Text>
                     <View style={styles.rpsRow}>
                        {eylemler.map(e => (
                           <TouchableOpacity key={e.id} style={styles.rpsBtn} onPress={() => handleSecim(e.id)}>
                              <Text style={styles.rpsBtnEmoji}>{e.emoji}</Text>
                           </TouchableOpacity>
                        ))}
                     </View>
                  </View>
               )}
            </View>
         )}
      </View>
   );
};

// --- OYUN 5: RENK AVCISI ---
const RENKLER = [
   { isim: 'KIRMIZI', renk: '#e74c3c' },
   { isim: 'MAVİ', renk: '#3498db' },
   { isim: 'YEŞİL', renk: '#2ecc71' },
   { isim: 'SARI', renk: '#f1c40f' },
   { isim: 'SİYAH', renk: '#2d3436' },
   { isim: 'MOR', renk: '#9b59b6' }
];

const RenkAvcisiOyunu = ({ onMenuCikisi, oyunSessizOdulVer, isDarkMode }) => {
   const [oyunBitti, setOyunBitti] = useState(false);
   const [oyunAktif, setOyunAktif] = useState(false);
   const [kazanilanOdul, setKazanilanOdul] = useState({ altin: 0, xp: 0, mutluluk: 0 });
   const [kalanSure, setKalanSure] = useState(10);
   const [skor, setSkor] = useState(0);
   const [hedefRenk, setHedefRenk] = useState(null);
   const [siklar, setSiklar] = useState([]);

   const oyunaBasla = () => {
      setSkor(0);
      setKalanSure(10);
      setOyunBitti(false);
      setOyunAktif(true);
      soruOlustur();
   };

   const soruOlustur = () => {
      const gecerliRenkler = [...RENKLER].sort(() => Math.random() - 0.5).slice(0, 4);
      const dogru = gecerliRenkler[Math.floor(Math.random() * 4)];
      setHedefRenk(dogru);
      setSiklar(gecerliRenkler);
   };

   useEffect(() => {
      let timer = null;
      if (oyunAktif && kalanSure > 0) {
         timer = setInterval(() => setKalanSure(p => p - 1), 1000);
      }
      return () => clearInterval(timer);
   }, [oyunAktif, kalanSure]);

   useEffect(() => {
      if (kalanSure <= 0 && oyunAktif) {
         setOyunAktif(false);
         const wPuan = skor * 4;
         let kMut = wPuan; let kX = wPuan * 2; let kAl = Math.max(5, wPuan);
         if(skor === 0) { kMut = -10; kX = 0; kAl = 0; }
         setKazanilanOdul({ mutluluk: kMut, xp: kX, altin: kAl });
         setOyunBitti(true);
      }
   }, [kalanSure, oyunAktif, skor]);

   const secimKontrol = (secim) => {
      if (secim.isim === hedefRenk.isim) {
         setSkor(p => p + 1);
      } else {
         setKalanSure(p => Math.max(0, p - 2));
      }
      soruOlustur();
   };

   const handleTekrarOyna = () => { oyunSessizOdulVer(kazanilanOdul.mutluluk, kazanilanOdul.xp, kazanilanOdul.altin); oyunaBasla(); };
   const handleMenuyeDon = () => { oyunSessizOdulVer(kazanilanOdul.mutluluk, kazanilanOdul.xp, kazanilanOdul.altin); onMenuCikisi(); };

   return (
      <View style={[styles.gameContainer, isDarkMode && { backgroundColor: '#121212' }]}>
         {oyunBitti ? <GameOverOverlay odul={kazanilanOdul} onTekrarOyna={handleTekrarOyna} onMenuyeDon={handleMenuyeDon} />
         : !oyunAktif ? (
            <View style={styles.startContainer}>
               <Text style={[styles.title, isDarkMode && { color: '#ffffff' }]}>Renk Avcısı 🎨</Text>
               <Text style={[styles.desc, isDarkMode && { color: '#b2bec3' }]}>Kutunun GÖRSEL RENGİNİ okuyan yazıyı bul! (Hatalar süreden yer)</Text>
               <TouchableOpacity style={[styles.startButton, {backgroundColor: '#e17055'}]} onPress={oyunaBasla} activeOpacity={0.8}>
                  <Text style={styles.startButtonText}>Başla</Text>
               </TouchableOpacity>
            </View>
         ) : (
            <View style={styles.colorArea}>
               <View style={styles.colorHeader}>
                  <Text style={styles.scoreText}>Skor: {skor}</Text>
                  <Text style={styles.timeText}>Süre: {kalanSure}s</Text>
               </View>
               <View style={[styles.colorBoxWrapper, { backgroundColor: hedefRenk?.renk }]} />
               <View style={styles.colorBtnGrid}>
                  {siklar.map((secim, i) => (
                     <TouchableOpacity key={i} style={styles.colorBtn} onPress={() => secimKontrol(secim)} activeOpacity={0.8}>
                        <Text style={styles.colorBtnText}>{secim.isim}</Text>
                     </TouchableOpacity>
                  ))}
               </View>
            </View>
         )}
      </View>
   );
};

// --- ANA OYUN SEÇİM & RENDER EKRANI ---
const GameScreen = () => {
  const { isLoaded, oyunSessizOdulVer, isDarkMode } = useContext(TamagotchiContext);
  const [secilenOyun, setSecilenOyun] = useState(null); 

  if (!isLoaded) return null;

  const handleMenuDonus = () => {
     setSecilenOyun(null);
  };

  if (secilenOyun === 'tap') return <TapTapGame onMenuCikisi={handleMenuDonus} oyunSessizOdulVer={oyunSessizOdulVer} isDarkMode={isDarkMode} />;
  if (secilenOyun === 'memory') return <HafizaOyunu onMenuCikisi={handleMenuDonus} oyunSessizOdulVer={oyunSessizOdulVer} isDarkMode={isDarkMode} />;
  if (secilenOyun === 'math') return <MatematikOyunu onMenuCikisi={handleMenuDonus} oyunSessizOdulVer={oyunSessizOdulVer} isDarkMode={isDarkMode} />;
  if (secilenOyun === 'rps') return <TasKagitMakasOyunu onMenuCikisi={handleMenuDonus} oyunSessizOdulVer={oyunSessizOdulVer} isDarkMode={isDarkMode} />;
  if (secilenOyun === 'color') return <RenkAvcisiOyunu onMenuCikisi={handleMenuDonus} oyunSessizOdulVer={oyunSessizOdulVer} isDarkMode={isDarkMode} />;

  return (
    <ScrollView style={[styles.menuContainer, isDarkMode && { backgroundColor: '#121212' }]} contentContainerStyle={{paddingBottom:40}} showsVerticalScrollIndicator={false}>
       <Text style={[styles.menuTitle, isDarkMode && { color: '#ffffff' }]}>🎮 Oyun Salonu</Text>
       <Text style={[styles.menuSub, isDarkMode && { color: '#b2bec3' }]}>Eğlenerek Evcil Hayvanını Mutlu Et ve Bolca XP ile Altın Kazan!</Text>
       
       <TouchableOpacity style={[styles.oyunCard, isDarkMode && { backgroundColor: '#1e1e1e' }]} onPress={() => setSecilenOyun('tap')} activeOpacity={0.8}>
           <Text style={styles.cardEmoji}>🧶</Text>
           <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, isDarkMode && { color: '#74b9ff' }]}>Tap-Tap Catcher</Text>
              <Text style={[styles.cardDesc, isDarkMode && { color: '#b2bec3' }]}>Ekranda aniden beliren hedefleri süre bitmeden yakalama yarışı. Hızlı refleksler gerekir!</Text>
           </View>
       </TouchableOpacity>

       <TouchableOpacity style={[styles.oyunCard, isDarkMode && { backgroundColor: '#1e1e1e' }]} onPress={() => setSecilenOyun('memory')} activeOpacity={0.8}>
           <Text style={styles.cardEmoji}>🃏</Text>
           <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, isDarkMode && { color: '#74b9ff' }]}>Hafıza Kartları</Text>
              <Text style={[styles.cardDesc, isDarkMode && { color: '#b2bec3' }]}>Kartları çevir, çiftlerini bul. Ne kadar az hamle yaparsan o kadar çok ödül alırsın!</Text>
           </View>
       </TouchableOpacity>

       <TouchableOpacity style={[styles.oyunCard, isDarkMode && { backgroundColor: '#1e1e1e' }]} onPress={() => setSecilenOyun('math')} activeOpacity={0.8}>
           <Text style={styles.cardEmoji}>🧠</Text>
           <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, isDarkMode && { color: '#74b9ff' }]}>Hızlı Matematik</Text>
              <Text style={[styles.cardDesc, isDarkMode && { color: '#b2bec3' }]}>15 Saniye içinde basit işlemleri zihinden çöz. Yanlış cevaplar süreden yer!</Text>
           </View>
       </TouchableOpacity>

       <TouchableOpacity style={[styles.oyunCard, isDarkMode && { backgroundColor: '#1e1e1e' }]} onPress={() => setSecilenOyun('rps')} activeOpacity={0.8}>
           <Text style={styles.cardEmoji}>✊</Text>
           <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, isDarkMode && { color: '#74b9ff' }]}>Taş-Kağıt-Makas</Text>
              <Text style={[styles.cardDesc, isDarkMode && { color: '#b2bec3' }]}>Rakibine karşı doğru hamleyi yap. Galibiyet anında 20 Altın ve 30 XP senin olur!</Text>
           </View>
       </TouchableOpacity>

       <TouchableOpacity style={[styles.oyunCard, isDarkMode && { backgroundColor: '#1e1e1e' }]} onPress={() => setSecilenOyun('color')} activeOpacity={0.8}>
           <Text style={styles.cardEmoji}>🎨</Text>
           <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, isDarkMode && { color: '#74b9ff' }]}>Renk Avcısı</Text>
              <Text style={[styles.cardDesc, isDarkMode && { color: '#b2bec3' }]}>Ekrana çıkan kutunun rengini anında seç! Dikkat et, yanlış şıklar zamanından silecek.</Text>
           </View>
       </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  menuContainer: { flex: 1, backgroundColor: '#f1f2f6', padding: 20, paddingTop: 40 },
  menuTitle: { fontSize: 30, fontWeight: '900', color: '#2d3436', marginBottom: 10 },
  menuSub: { fontSize: 15, color: '#636e72', marginBottom: 30, lineHeight: 22 },
  oyunCard: {
     flexDirection: 'row', backgroundColor: '#ffffff', padding: 20, borderRadius: 24,
     marginBottom: 20, alignItems: 'center',   elevation: 5,
  },
  cardEmoji: { fontSize: 50, marginRight: 20 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#0984e3', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#636e72', lineHeight: 18 },
  
  // ORTAK OYUN STİLLERİ
  gameContainer: { flex: 1, backgroundColor: '#f1f2f6' },
  startContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  title: { fontSize: 32, fontWeight: '900', color: '#2d3436', marginBottom: 16, textAlign: 'center' },
  desc: { fontSize: 16, color: '#636e72', textAlign: 'center', marginBottom: 40, lineHeight: 24 },
  startButton: { backgroundColor: '#10ac84', paddingVertical: 18, paddingHorizontal: 50, borderRadius: 20, elevation: 8 },
  startButtonText: { color: '#ffffff', fontSize: 20, fontWeight: '900' },
  gameArea: { flex: 1, backgroundColor: '#dfe6e9', position: 'relative' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', padding: 24, paddingTop: 40,
    backgroundColor: '#f1f2f6', elevation: 5, zIndex: 10,
  },
  scoreText: { fontSize: 24, fontWeight: '900', color: '#0984e3' },
  timeText: { fontSize: 24, fontWeight: '900', color: '#d63031' },
  target: {
    position: 'absolute', width: 60, height: 60, backgroundColor: '#ffffff', borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', elevation: 5,
  },
  targetEmoji: { fontSize: 34 },

  // MEMORY OYUNU
  memoryArea: { flex: 1, backgroundColor: '#dfe6e9' },
  hamleText: { fontSize: 20, fontWeight: '800', color: '#2c3e50', marginBottom: 30 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, paddingHorizontal: 20 },
  memoryCard: { width: 75, height: 90, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  memoryCardKapali: { backgroundColor: '#0984e3' },
  memoryCardAcik: { backgroundColor: '#ffffff' },
  memoryEmoji: { fontSize: 30 },

  // MATH OYUNU
  mathArea: { flex: 1, backgroundColor: '#2c3e50' },
  mathHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 24, paddingTop: 40, backgroundColor: 'transparent' },
  soruKutusu: { marginTop: 60, alignItems: 'center', justifyContent: 'center' },
  soruText: { fontSize: 50, fontWeight: '900', color: '#ffffff' },
  siklarContainer: { marginTop: 80, paddingHorizontal: 20, gap: 20 },
  sikBtn: { backgroundColor: '#1abc9c', paddingVertical: 20, borderRadius: 16, alignItems: 'center' },
  sikText: { fontSize: 26, fontWeight: '800', color: '#ffffff' },

  // GAME OVER OVERLAY
  gameOverOverlay: {
     flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
     justifyContent: 'center', alignItems: 'center', padding: 20
  },
  gameOverCard: {
     width: '100%', maxWidth: 350, backgroundColor: '#ffffff',
     borderRadius: 30, padding: 30, alignItems: 'center',
       elevation: 15
  },
  gameOverEmoji: { fontSize: 60, marginBottom: 10 },
  gameOverTitle: { fontSize: 28, fontWeight: '900', color: '#2d3436', marginBottom: 20 },
  rewardsContainer: {
     backgroundColor: '#f1f2f6', width: '100%', borderRadius: 20,
     padding: 20, alignItems: 'center', marginBottom: 30
  },
  rewardText: { fontSize: 18, fontWeight: '800', color: '#0984e3', marginVertical: 4 },
  gameOverButtons: { width: '100%', gap: 12 },
  goBtn: { width: '100%', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  goBtnAgain: { backgroundColor: '#10ac84' },
  goBtnMenu: { backgroundColor: '#d63031' },
  goBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '900' },

  // RPS (TAŞ KAĞIT MAKAS)
  rpsArea: { flex: 1, backgroundColor: '#f39c12', justifyContent: 'center', alignItems: 'center' },
  rpsResultTitle: { fontSize: 36, fontWeight: '900', color: '#ffffff', marginBottom: 40, textAlign: 'center' },
  rpsMatch: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  rpsEmoji: { fontSize: 80 },
  rpsVs: { fontSize: 40, fontWeight: '900', color: '#ffffff' },
  rpsChoices: { alignItems: 'center' },
  rpsChooseTitle: { fontSize: 32, fontWeight: '900', color: '#ffffff', marginBottom: 40 },
  rpsRow: { flexDirection: 'row', gap: 20 },
  rpsBtn: { backgroundColor: '#ffffff', width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', elevation: 10 },
  rpsBtnEmoji: { fontSize: 45 },

  // COLOR CATCHER
  colorArea: { flex: 1, backgroundColor: '#e17055' },
  colorHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 24, paddingTop: 40 },
  colorBoxWrapper: { width: 200, height: 200, borderRadius: 20, alignSelf: 'center', marginTop: 30, elevation: 10, borderWidth: 5, borderColor: '#ffffff' },
  colorBtnGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, marginTop: 50, paddingHorizontal: 20 },
  colorBtn: { backgroundColor: '#ffffff', width: '45%', paddingVertical: 20, borderRadius: 16, alignItems: 'center', elevation: 5 },
  colorBtnText: { fontSize: 20, fontWeight: '900', color: '#2d3436' }
});

export default GameScreen;
