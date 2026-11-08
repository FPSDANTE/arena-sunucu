# Arena 1v1 sunucusu

Oda kodu, hızlı eşleşme ve oyuncular arası mesaj aktarma yapar. Bütün trafik sunucudan geçtiği için
NAT / güvenlik duvarı sorunu olmaz (ayrı TURN sunucusu gerekmez).

## Yerelde deneme
    npm install
    npm start        # ws://localhost:8080
Oyunu şu şekilde aç:  fps-arena.html?s=ws://localhost:8080

## Yayına alma (Render, Railway, Fly.io gibi Node.js barındıran herhangi bir servis)
1. Bu klasörü GitHub'a yükle.
2. Serviste yeni "Web Service" oluştur. Build komutu: npm install   Başlatma komutu: npm start
3. Servis sana https://...onrender.com gibi bir adres verir. Oyunda bunu wss:// ile kullan:
   fps-arena.html?s=wss://ADRESIN
4. Çalışıyorsa fps-arena.html içindeki SERVER_URL satırına bu adresi kalıcı yaz.
Not: Ücretsiz planlar boşta kalınca uykuya geçebilir, ilk bağlantı gecikebilir. Güncel planları kontrol et.

## Ne yapıyor / yapmıyor
- Mesaj hızı, ışınlanma, hasar miktarı ve atış hızı için temel sınırlar var.
- İsabet kontrolü hâlâ istemci tarafında. Tam hile koruması için ileride sunucuda oyun simülasyonu gerekir.
