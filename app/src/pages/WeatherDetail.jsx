import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Cloud, CloudRain, Sun, CloudSun, Droplets, 
  Wind, MapPin, ChevronRight, CheckCircle2, Umbrella
} from 'lucide-react';

const WeatherDetail = () => {
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState(null);
  const [locationName, setLocationName] = useState('स्थान शोधत आहे...');
  const [loading, setLoading] = useState(true);
  const passedWeather = location.state?.weather;

  const getWeatherIcon = (code, size = 22) => {
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      return <CloudRain size={size} className="text-cyan-300 drop-shadow" />;
    } else if (code >= 1 && code <= 3) {
      return <CloudSun size={size} className="text-amber-200 drop-shadow" />;
    } else if (code >= 45 && code <= 48) {
      return <Cloud size={size} className="text-gray-300 drop-shadow" />;
    }
    return <Sun size={size} className="text-amber-400 drop-shadow" />;
  };

  useEffect(() => {
    // १. अक्षांश-रेखांशावरून चालू गावाचे/शहराचे नाव शोधणे (Live Reverse Geocoding)
    const fetchCityName = async (lat, lon) => {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`
        );
        const geoData = await geoRes.json();
        const city = 
          geoData.address?.city || 
          geoData.address?.town || 
          geoData.address?.village || 
          geoData.address?.suburb || 
          geoData.address?.county || 
          'तुमचा परिसर';
        setLocationName(`${city} (तुमचा परिसर Live)`);
      } catch (e) {
        setLocationName('तुमचा परिसर (Live)');
      }
    };

    // २. संपूर्ण हवामान माहिती मिळवणे
    const fetchFullWeather = async (lat, lon) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();
        setWeatherData(data);
        setLoading(false);
      } catch (err) {
        console.error('Weather error:', err);
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          fetchCityName(lat, lon);
          fetchFullWeather(lat, lon);
        },
        () => {
          fetchCityName(18.9894, 73.1175); // डिफॉल्ट
          fetchFullWeather(18.9894, 73.1175);
        }
      );
    } else {
      fetchCityName(18.9894, 73.1175);
      fetchFullWeather(18.9894, 73.1175);
    }
  }, []);

  const currentWeather = passedWeather || weatherData?.current; 
  const isRaining = Boolean(
    weatherData?.current && (
      weatherData.current.precipitation > 0 || 
      (weatherData.current.weather_code >= 51 && weatherData.current.weather_code <= 67) ||
      (weatherData.current.weather_code >= 80 && weatherData.current.weather_code <= 82)
    )
  );

// const isRaining = true;

// पारदर्शक आणि 100% काम करणाऱ्या पीएनजी इमेजेस
  const girlNormalModel = "https://png.pngtree.com/png-clipart/20230913/original/pngtree-girl-walking-png-image_11068832.png";
  const girlRainModel = "https://png.pngtree.com/png-clipart/20230913/original/pngtree-rain-girl-umbrella-png-image_11068835.png";

  const getHourlyData = () => {
    if (!weatherData?.hourly) return [];
    const currentHour = new Date().getHours();
    const result = [];
    for (let i = currentHour; i < currentHour + 8; i++) {
      if (weatherData.hourly.time[i]) {
        const timeStr = weatherData.hourly.time[i].split('T')[1].substring(0, 5);
        result.push({
          time: timeStr,
          temp: Math.round(weatherData.hourly.temperature_2m[i]),
          rainProb: weatherData.hourly.precipitation_probability[i] || 0,
          code: weatherData.hourly.weather_code[i]
        });
      }
    }
    return result;
  };

  const getDailyData = () => {
    if (!weatherData?.daily) return [];
    const daysName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return weatherData.daily.time.slice(0, 7).map((t, idx) => {
      const dObj = new Date(t);
      return {
        day: idx === 0 ? 'Today' : daysName[dObj.getDay()],
        max: Math.round(weatherData.daily.temperature_2m_max[idx]),
        min: Math.round(weatherData.daily.temperature_2m_min[idx]),
        rainProb: weatherData.daily.precipitation_probability_max[idx] || 0,
        code: weatherData.daily.weather_code[idx]
      };
    });
  };

  const hourlyList = getHourlyData();
  const dailyList = getDailyData();

  return (
    <IonPage>
      <IonContent fullscreen className="no-scroll">
        <div className="w-full min-h-screen relative overflow-y-auto pb-14 text-white select-none bg-gradient-to-b from-[#3a5d70] via-[#244550] to-[#12282e]">
          
          {/* १. निसर्गरम्य पार्श्वभूमी आणि थेट चालत येणारी मुलगी */}
          <div className="relative w-full h-[370px] overflow-hidden">
            {/* हिरवेगार शेत/पार्श्वभूमी */}
            <div 
              className="absolute inset-0 bg-cover bg-bottom opacity-45 mix-blend-luminosity"
              style={{
                backgroundImage: isRaining 
                  ? "url('https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=900&q=80')" 
                  : "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=80')"
              }}
            />

            {/* पाऊस असल्यास पडणारे पावसाचे थेंब */}
            {isRaining && (
              <div className="absolute inset-0 pointer-events-none z-10">
                {[...Array(26)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-[1.5px] bg-gradient-to-b from-transparent via-cyan-200 to-white/95 rounded-full animate-screen-rain"
                    style={{
                      height: `${Math.random() * 24 + 18}px`,
                      left: `${i * 3.8}%`,
                      animationDelay: `${Math.random() * 0.7}s`,
                      animationDuration: `${0.55 + Math.random() * 0.25}s`
                    }}
                  />
                ))}
              </div>
            )}

         {/* 🔥 उजवीकडून चालत येणारी, मध्ये थांबून पाहणारी थेट ॲनिमेटेड मुलगी (Real Walking GIF) */}
            <div className="absolute right-2 bottom-0 z-10 w-44 h-64 flex items-end justify-center pointer-events-none animate-girl-walk">
            <img 
              src={isRaining 
               ? "https://media.tenor.com/e5B3K314zocAAAAC/girl-rain.gif" 
                : "https://media.tenor.com/yFhH8w82n_4AAAAC/walk-girl.gif"
        } 
            alt="Walking Girl"
             className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
             onError={(e) => {
      // बॅकअप लिंक (जर Tenor ब्लॉक झाले तर Giphy चालते)
         e.target.src = isRaining 
          ? "https://media.giphy.com/media/l41JRsph73VokN6ik/giphy.gif"
       : "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif";
          }}
          />
         </div>
            {/* ग्रेडियंट शेड */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-[#12282e] z-0"></div>

            {/* टॉप नेव्हिगेशन बार - थेट गाव/शहराच्या नावासह */}
            <div 
              className="relative z-20 px-4 pt-3 flex items-center justify-between"
              style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
            >
              <button 
                onClick={() => navigate(-1)}
                className="p-2 bg-black/25 backdrop-blur-md rounded-full border border-white/10 active:scale-95 transition-all"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>

              <div className="flex items-center space-x-1.5 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm">
                <MapPin size={13} className="text-emerald-300 animate-bounce" />
                <span className="text-xs font-bold tracking-wide text-white">
                  {locationName}
                </span>
              </div>

              <div className="w-9" />
            </div>

            {/* चालू तापमान व स्थिती (डाव्या बाजूला) */}
            <div className="relative z-20 px-5 pt-3 max-w-[58%]">
              <div className="text-6xl font-light tracking-tighter leading-none drop-shadow-md">
                {weatherData ? Math.round(weatherData.current.temperature_2m) : '--'}°
              </div>
              <h2 className="text-xl font-bold mt-1 text-white drop-shadow">
                {isRaining ? 'पाऊस / Drizzle' : weatherData?.current?.weather_code <= 2 ? 'स्वच्छ / Clear' : 'ढगाळ / Mist'}
              </h2>
              
              {weatherData && (
                <div className="mt-2 text-xs font-semibold text-white/85 space-y-0.5">
                  <p>↑ {Math.round(weatherData.daily.temperature_2m_max[0])}° / ↓ {Math.round(weatherData.daily.temperature_2m_min[0])}°</p>
                  <p className="text-[11px] text-white/75">Feels like {Math.round(weatherData.current.apparent_temperature)}°</p>
                </div>
              )}
            </div>

            {/* हवामानाचा संक्षिप्त सल्ला */}
            <div className="absolute bottom-2 left-5 right-5 z-20">
              <p className="text-xs font-medium text-white/90 drop-shadow line-clamp-2">
                {isRaining 
                  ? 'दिवसभर रिमझिम पावसाची शक्यता आहे. शेतीची फवारणी आज टाळा.'
                  : `Highs ${weatherData ? Math.round(weatherData.daily.temperature_2m_max[0]) : 32}°C and lows ${weatherData ? Math.round(weatherData.daily.temperature_2m_min[0]) : 24}°C.`}
              </p>
            </div>
          </div>

          {/* २. ग्लास-मॉर्फिझम वेदर कार्ड्स */}
          <div className="px-4 space-y-3 relative z-20 -mt-2">
            
            {/* तासांचा अंदाज (Hourly Scroll With Curve Line) */}
            <div className="bg-[#18343c]/80 backdrop-blur-xl border border-white/15 rounded-3xl p-4 shadow-2xl">
              <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-1">
                {hourlyList.map((h, i) => (
                  <div key={i} className="flex flex-col items-center min-w-[54px] space-y-2">
                    <span className="text-[11px] font-semibold text-white/70">{h.time}</span>
                    <div className="my-0.5">
                      {getWeatherIcon(h.code, 22)}
                    </div>
                    <span className="text-sm font-bold text-white">{h.temp}°</span>
                    
                    {/* पिवळा पॉइंट (Temperature Curve Point) */}
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm"></div>

                    <div className="flex items-center text-[10px] font-bold text-cyan-200">
                      <Droplets size={10} className="mr-0.5" />
                      <span>{h.rainProb}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10 flex justify-end items-center">
                <span className="text-[11px] font-bold text-cyan-200 flex items-center cursor-pointer">
                  24-hour forecast <ChevronRight size={14} className="ml-0.5" />
                </span>
              </div>
            </div>

            {/* फवारणी व छत्री सल्ला बॉक्स */}
            <div className="bg-[#18343c]/80 backdrop-blur-xl border border-white/15 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-black/25 rounded-xl border border-white/10">
                  {isRaining ? (
                    <Umbrella size={22} className="text-cyan-300 animate-bounce" />
                  ) : (
                    <CheckCircle2 size={22} className="text-emerald-300" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {isRaining ? 'Grab an Umbrella!' : 'फवारणीसाठी अनुकूल दिवस'}
                  </h4>
                  <p className="text-[11px] text-white/70">
                    {isRaining ? 'पुढील काही तास पाऊस सुरू राहू शकतो' : 'वाऱ्याचा वेग शांत असून हवामान कोरडे आहे'}
                  </p>
                </div>
              </div>
              <span className="text-sm font-black text-white/90 bg-white/10 px-2.5 py-1 rounded-xl">
                {isRaining ? '< 2mm' : '0 mm'}
              </span>
            </div>

            {/* ७ दिवसांचा हवामान अंदाज (Daily Forecast) */}
            <div className="bg-[#18343c]/80 backdrop-blur-xl border border-white/15 rounded-3xl p-4 shadow-2xl">
              <h3 className="text-xs font-bold text-white/80 mb-2 px-1">7 दिवसांचा हवामान अंदाज</h3>
              <div className="divide-y divide-white/10">
                {dailyList.map((d, index) => (
                  <div key={index} className="flex items-center justify-between py-2.5 text-xs">
                    <span className="w-14 font-bold text-white/90">{d.day}</span>
                    
                    <div className="flex items-center space-x-1 w-14">
                      <Droplets size={11} className="text-cyan-300" />
                      <span className="text-[10px] font-bold text-cyan-100">{d.rainProb}%</span>
                    </div>

                    <div className="w-8 flex justify-center">
                      {getWeatherIcon(d.code, 18)}
                    </div>

                    <div className="flex items-center space-x-2 font-bold w-16 justify-end">
                      <span className="text-white">{d.max}°</span>
                      <span className="text-white/50">{d.min}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default WeatherDetail;