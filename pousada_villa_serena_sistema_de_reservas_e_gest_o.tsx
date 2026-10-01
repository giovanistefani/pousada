import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Users,
  Search,
  CheckCircle2,
  Clock,
  LogOut,
  LogIn,
  BedDouble,
  DollarSign,
  Coffee,
  Wifi,
  Tv,
  Wind,
  Sparkles,
  Bath,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Home,
  SlidersHorizontal,
  Bookmark,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  UtensilsCrossed,
  Filter,
  RefreshCw,
  Sun,
  Eye,
  KeyRound
} from "lucide-react";

const INITIAL_ROOMS = [
  {
    id: "RM-101",
    name: "Suíte Master com Hidro",
    category: "Suíte Master",
    capacity: 2,
    price: 680,
    size: "45 m²",
    bed: "1 Cama King Size",
    amenities: ["Hidromassagem", "Varanda com Vista", "Ar-Condicionado", "Wi-Fi Fibra", "Café Gourmet", "Smart TV 55\""],
    status: "occupied", // available, occupied, cleaning, maintenance
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    description: "Nossa acomodação mais nobre com banheira de imersão dupla, cama com dossel e varanda privativa voltada para a serra."
  },
  {
    id: "RM-102",
    name: "Chalé Jardim das Hortênsias",
    category: "Chalé Jardim",
    capacity: 4,
    price: 520,
    size: "52 m²",
    bed: "1 Cama Queen + 2 Camas Solteiro",
    amenities: ["Lareira Ecológica", "Deck Privativo", "Rede de Descanso", "Wi-Fi Fibra", "Frigobar Retrô", "Cafeteira Nespresso"],
    status: "available",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    description: "Ambiente rústico e aconchegante cercado por flores, lareira a lenha e deque privativo com rede para contemplação."
  },
  {
    id: "RM-103",
    name: "Suíte Romântica Serena",
    category: "Suíte Romântica",
    capacity: 2,
    price: 490,
    size: "38 m²",
    bed: "1 Cama Queen Size",
    amenities: ["Ar-Condicionado", "Frigobar", "Wi-Fi Fibra", "Vista Bosque", "Chuveiro Duplo"],
    status: "cleaning",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
    description: "Projetada para casais que buscam tranquilidade, com iluminação acolhedora e enxoval 400 fios de puro algodão egípcio."
  },
  {
    id: "RM-104",
    name: "Apartamento Standard Confort",
    category: "Standard",
    capacity: 3,
    price: 340,
    size: "32 m²",
    bed: "1 Cama Casal + 1 Solteiro",
    amenities: ["Wi-Fi Fibra", "Ar-Condicionado", "Smart TV", "Cofre Digital", "Mesa de Trabalho"],
    status: "available",
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
    description: "Conforto prático e elegante, perfeito para estadias de descanso e pequenas famílias que priorizam excelente custo-benefício."
  },
  {
    id: "RM-105",
    name: "Chalé Mirante da Serra",
    category: "Chalé Jardim",
    capacity: 2,
    price: 590,
    size: "44 m²",
    bed: "1 Cama King Size",
    amenities: ["Ofurô Externo", "Vista Panorâmica", "Ar Quente/Frio", "Adega de Vinhos", "Wi-Fi Fibra"],
    status: "maintenance",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
    description: "No ponto mais alto da pousada, possui ofurô aquecido ao ar livre sob um pergolado de madeira nobre."
  },
  {
    id: "RM-106",
    name: "Suíte Família Raízes",
    category: "Família",
    capacity: 5,
    price: 610,
    size: "60 m²",
    bed: "1 Cama Queen + 3 Camas Solteiro",
    amenities: ["2 Ambientes", "Cozinha de Apoio", "Varanda Térrea", "Wi-Fi Fibra", "Smart TV 50\""],
    status: "available",
    image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
    description: "Espaço amplo com dois ambientes integrados, ideal para viajar com crianças ou grupos de amigos mantendo a privacidade."
  }
];

// Helper to calculate days difference
const calculateNights = (checkInStr, checkOutStr) => {
  if (!checkInStr || !checkOutStr) return 1;
  const inD = new Date(checkInStr);
  const outD = new Date(checkOutStr);
  const diffTime = outD.getTime() - inD.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
};

// Generate realistic date strings
const today = new Date();
const formatDate = (date) => date.toISOString().split("T")[0];
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const dateTodayStr = formatDate(today);
const dateTomorrowStr = formatDate(addDays(today, 1));
const dateIn3DaysStr = formatDate(addDays(today, 3));
const dateYesterdayStr = formatDate(addDays(today, -1));

const INITIAL_BOOKINGS = [
  {
    id: "VS-8821",
    roomId: "RM-101",
    roomName: "Suíte Master com Hidro",
    guestName: "Dra. Mariana Albuquerque",
    guestEmail: "mariana.albuquerque@email.com",
    guestPhone: "(11) 98721-4321",
    guestsCount: 2,
    checkIn: dateYesterdayStr,
    checkOut: dateTomorrowStr,
    nights: 2,
    totalPrice: 1360,
    specialRequests: "Espumante de boas-vindas e almofadas antialérgicas.",
    status: "checked_in", // confirmed, checked_in, checked_out, cancelled
    createdAt: "2026-09-20"
  },
  {
    id: "VS-9042",
    roomId: "RM-102",
    roomName: "Chalé Jardim das Hortênsias",
    guestName: "Roberto & Camila Mendonça",
    guestEmail: "roberto.mendonca@gmail.com",
    guestPhone: "(21) 99120-7788",
    guestsCount: 4,
    checkIn: dateTodayStr,
    checkOut: dateIn3DaysStr,
    nights: 3,
    totalPrice: 1560,
    specialRequests: "Lenha extra para a lareira e check-in tardio (19h).",
    status: "confirmed",
    createdAt: "2026-09-24"
  },
  {
    id: "VS-7763",
    roomId: "RM-104",
    roomName: "Apartamento Standard Confort",
    guestName: "Felipe Silveira Santos",
    guestEmail: "felipe.santos@tecnologia.com.br",
    guestPhone: "(48) 98833-2190",
    guestsCount: 1,
    checkIn: dateTodayStr,
    checkOut: dateTomorrowStr,
    nights: 1,
    totalPrice: 340,
    specialRequests: "Silêncio para reuniões matinais online.",
    status: "confirmed",
    createdAt: "2026-09-28"
  },
  {
    id: "VS-6519",
    roomId: "RM-106",
    roomName: "Suíte Família Raízes",
    guestName: "Beatriz Nogueira Lima",
    guestEmail: "beatriz.lima@yahoo.com",
    guestPhone: "(31) 97755-1200",
    guestsCount: 4,
    checkIn: formatDate(addDays(today, -3)),
    checkOut: dateTodayStr,
    nights: 3,
    totalPrice: 1830,
    specialRequests: "Berço infantil no quarto adicional.",
    status: "checked_out",
    createdAt: "2026-09-15"
  }
];

export default function App() {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState("portal"); // "portal" (Hóspede) or "admin" (Gestão)
  
  // Data Store
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);

  // Guest Search Filters
  const [searchCheckIn, setSearchCheckIn] = useState(dateTodayStr);
  const [searchCheckOut, setSearchCheckOut] = useState(dateTomorrowStr);
  const [searchGuests, setSearchGuests] = useState(2);
  const [searchCategory, setSearchCategory] = useState("all");

  // Booking Modal
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [guestBookingForm, setGuestBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialRequests: ""
  });
  const [confirmedBookingResult, setConfirmedBookingResult] = useState(null);

  // Reservation Lookup Modal (Guest)
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupSearched, setLookupSearched] = useState(false);

  // Admin Section state
  const [adminView, setAdminView] = useState("dashboard"); // "dashboard", "rooms", "bookings"
  const [bookingFilterStatus, setBookingFilterStatus] = useState("all");
  const [bookingSearchText, setBookingSearchText] = useState("");
  
  // Room Editing/Creation modal
  const [editingRoom, setEditingRoom] = useState(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomFormData, setRoomFormData] = useState({
    id: "",
    name: "",
    category: "Suíte Master",
    capacity: 2,
    price: 450,
    size: "35 m²",
    bed: "1 Cama Casal",
    status: "available",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    description: "",
    amenities: ["Wi-Fi Fibra", "Ar-Condicionado", "Smart TV"]
  });

  // Calculate nights for search form
  const calculatedNights = useMemo(() => {
    return calculateNights(searchCheckIn, searchCheckOut);
  }, [searchCheckIn, searchCheckOut]);

  const filteredRoomsForGuest = useMemo(() => {
    return rooms.filter((r) => {
      if (r.capacity < searchGuests) return false;
      if (searchCategory !== "all" && r.category !== searchCategory) return false;
      return true;
    });
  }, [rooms, searchGuests, searchCategory]);

  const metrics = useMemo(() => {
    const totalRooms = rooms.length;
    const occupiedCount = rooms.filter(r => r.status === "occupied").length;
    const cleaningCount = rooms.filter(r => r.status === "cleaning").length;
    const maintenanceCount = rooms.filter(r => r.status === "maintenance").length;
    const availableCount = rooms.filter(r => r.status === "available").length;

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

    // Today's check-ins & check-outs
    const todayCheckIns = bookings.filter(b => b.checkIn === dateTodayStr && b.status === "confirmed");
    const todayCheckOuts = bookings.filter(b => b.checkOut === dateTodayStr && b.status === "checked_in");

    // Total Revenue (all non-cancelled)
    const activeRevenue = bookings
      .filter(b => b.status !== "cancelled")
      .reduce((acc, curr) => acc + curr.totalPrice, 0);

    return {
      totalRooms,
      occupiedCount,
      cleaningCount,
      maintenanceCount,
      availableCount,
      occupancyRate,
      todayCheckInsCount: todayCheckIns.length,
      todayCheckOutsCount: todayCheckOuts.length,
      activeRevenue
    };
  }, [rooms, bookings, dateTodayStr]);

  const handleOpenBooking = (room) => {
    setSelectedRoomForBooking(room);
    setGuestBookingForm({
      name: "",
      email: "",
      phone: "",
      specialRequests: ""
    });
  };

  const handleCreateBookingSubmit = (e) => {
    e.preventDefault();
    if (!selectedRoomForBooking) return;

    const nights = calculateNights(searchCheckIn, searchCheckOut);
    const totalPrice = nights * selectedRoomForBooking.price;
    const newBookingId = `VS-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = {
      id: newBookingId,
      roomId: selectedRoomForBooking.id,
      roomName: selectedRoomForBooking.name,
      guestName: guestBookingForm.name,
      guestEmail: guestBookingForm.email,
      guestPhone: guestBookingForm.phone,
      guestsCount: searchGuests,
      checkIn: searchCheckIn,
      checkOut: searchCheckOut,
      nights: nights,
      totalPrice: totalPrice,
      specialRequests: guestBookingForm.specialRequests || "Nenhum pedido adicional informado.",
      status: "confirmed",
      createdAt: formatDate(new Date())
    };

    setBookings([newBooking, ...bookings]);

    // Show confirmation modal
    setConfirmedBookingResult(newBooking);
    setSelectedRoomForBooking(null);
  };

  const handleUpdateBookingStatus = (bookingId, newStatus) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        // If checking in, also set room to occupied
        if (newStatus === "checked_in") {
          updateRoomStatus(b.roomId, "occupied");
        } else if (newStatus === "checked_out") {
          updateRoomStatus(b.roomId, "cleaning");
        }
        return { ...b, status: newStatus };
      }
      return b;
    }));
  };

  const updateRoomStatus = (roomId, newStatus) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus } : r));
  };

  const handleLookupBooking = (e) => {
    e.preventDefault();
    setLookupSearched(true);
    const q = lookupQuery.trim().toLowerCase();
    const found = bookings.find(b => 
      b.id.toLowerCase() === q || 
      b.guestEmail.toLowerCase() === q ||
      b.guestPhone.includes(q)
    );
    setLookupResult(found || null);
  };

  const handleOpenRoomModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setRoomFormData({ ...room });
    } else {
      setEditingRoom(null);
      setRoomFormData({
        id: `RM-${Math.floor(100 + Math.random() * 900)}`,
        name: "",
        category: "Suíte Master",
        capacity: 2,
        price: 450,
        size: "35 m²",
        bed: "1 Cama Casal",
        status: "available",
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
        description: "",
        amenities: ["Wi-Fi Fibra", "Ar-Condicionado", "Smart TV"]
      });
    }
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = (e) => {
    e.preventDefault();
    if (editingRoom) {
      setRooms(prev => prev.map(r => r.id === editingRoom.id ? { ...roomFormData } : r));
    } else {
      setRooms(prev => [...prev, { ...roomFormData }]);
    }
    setIsRoomModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "available":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Disponível
        </span>;
      case "occupied":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> Ocupado
        </span>;
      case "cleaning":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span> Limpeza Pendente
        </span>;
      case "maintenance":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span> Em Manutenção
        </span>;
      default:
        return null;
    }
  };

  const getBookingStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Confirmada</span>;
      case "checked_in":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Check-in Realizado</span>;
      case "checked_out":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-200 text-zinc-700">Finalizada</span>;
      case "cancelled":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Cancelada</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 flex flex-col font-sans antialiased">
      {}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur text-stone-100 border-b border-stone-800 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-serif font-bold text-xl shadow-md">
              VS
            </div>
            <div>
              <div className="font-serif tracking-wide text-xl font-bold text-amber-100">
                Pousada Villa Serena
              </div>
              <p className="text-xs text-stone-400 hidden sm:block tracking-widest uppercase">
                Charme, Natureza & Tranquilidade
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher Toggle */}
            <div className="bg-stone-800 p-1 rounded-xl flex items-center border border-stone-700 text-xs sm:text-sm">
              <button
                onClick={() => setActiveTab("portal")}
                className={`px-3 sm:px-4 py-1.5 rounded-lg font-medium transition flex items-center gap-2 ${
                  activeTab === "portal"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-stone-300 hover:text-white"
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Portal do</span> Hóspede
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-3 sm:px-4 py-1.5 rounded-lg font-medium transition flex items-center gap-2 ${
                  activeTab === "admin"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-stone-300 hover:text-white"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Painel</span> Gestão
              </button>
            </div>

            {activeTab === "portal" && (
              <button
                onClick={() => {
                  setLookupSearched(false);
                  setLookupResult(null);
                  setLookupQuery("");
                  setShowLookupModal(true);
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition"
              >
                <Search className="w-3.5 h-3.5 text-amber-400" />
                Consultar Reserva
              </button>
            )}
          </div>
        </div>
      </header>

      {}
      {activeTab === "portal" && (
        <main className="flex-1 pb-16">
          {/* Hero Banner */}
          <div className="relative bg-stone-900 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div 
              className="absolute inset-0 opacity-40 bg-cover bg-center filter brightness-90"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80')"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent" />
            
            <div className="relative max-w-5xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs uppercase tracking-wider bg-amber-600/30 text-amber-300 border border-amber-500/40 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Refúgio na Serra & Gastronomia
              </span>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-amber-50">
                Viva dias inesquecíveis em meio à natureza
              </h1>
              <p className="mt-4 text-base sm:text-lg text-stone-300 max-w-2xl mx-auto font-light">
                Chalés acolhedores, banheiras de hidromassagem aquecidas e café da manhã artesanal servido com vista para o vale.
              </p>
            </div>
          </div>

          {/* Quick Search & Filter Card */}
          <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
            <div className="bg-white rounded-2xl shadow-xl border border-stone-200/80 p-5 sm:p-6 backdrop-blur">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                {/* Check-In */}
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                    Data de Check-in
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-amber-700 absolute left-3 top-3.5" />
                    <input
                      type="date"
                      value={searchCheckIn}
                      onChange={(e) => setSearchCheckIn(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-stone-800 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Check-Out */}
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                    Data de Check-out
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-amber-700 absolute left-3 top-3.5" />
                    <input
                      type="date"
                      value={searchCheckOut}
                      onChange={(e) => setSearchCheckOut(e.target.value)}
                      min={searchCheckIn}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-stone-800 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Hóspedes */}
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                    Hóspedes
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-amber-700 absolute left-3 top-3.5" />
                    <select
                      value={searchGuests}
                      onChange={(e) => setSearchGuests(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-stone-800 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                    >
                      <option value={1}>1 Adulto</option>
                      <option value={2}>2 Hóspedes (Casal)</option>
                      <option value={3}>3 Hóspedes</option>
                      <option value={4}>4 Hóspedes (Família)</option>
                      <option value={5}>5 Hóspedes ou mais</option>
                    </select>
                  </div>
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                    Estilo de Quarto
                  </label>
                  <div className="relative">
                    <BedDouble className="w-4 h-4 text-amber-700 absolute left-3 top-3.5" />
                    <select
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-stone-800 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                    >
                      <option value="all">Todas as categorias</option>
                      <option value="Suíte Master">Suíte Master</option>
                      <option value="Chalé Jardim">Chalé Jardim</option>
                      <option value="Suíte Romântica">Suíte Romântica</option>
                      <option value="Standard">Standard</option>
                      <option value="Família">Família</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Summary of nights bar */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-700">Período Selecionado:</span>
                  <span>{calculatedNights} {calculatedNights === 1 ? "diária" : "diárias"}</span>
                  <span>•</span>
                  <span>Capacidade mínima: {searchGuests} {searchGuests === 1 ? "pessoa" : "pessoas"}</span>
                </div>
                <div className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Café da manhã colonial artesanal incluso
                </div>
              </div>
            </div>
          </div>

          {/* Room Listings Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                  Nossas Acomodações
                </h2>
                <p className="text-stone-500 text-sm mt-1">
                  Exibindo {filteredRoomsForGuest.length} opções disponíveis para a sua busca
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLookupModal(true)}
                  className="md:hidden text-xs bg-stone-100 border border-stone-300 text-stone-700 px-3 py-2 rounded-lg font-medium flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" /> Já tem reserva?
                </button>
              </div>
            </div>

            {/* Grid of rooms */}
            {filteredRoomsForGuest.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
                <BedDouble className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-stone-700">Nenhum quarto encontrado</h3>
                <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
                  Tente alterar a categoria ou a quantidade de hóspedes nos filtros acima para visualizar mais opções.
                </p>
                <button
                  onClick={() => {
                    setSearchCategory("all");
                    setSearchGuests(2);
                  }}
                  className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRoomsForGuest.map((room) => {
                  const isAvailableNow = room.status === "available";
                  return (
                    <div
                      key={room.id}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-stone-200 flex flex-col group"
                    >
                      {/* Room Image & Badge */}
                      <div className="relative h-60 overflow-hidden">
                        <img
                          src={room.image}
                          alt={room.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-900/80 backdrop-blur text-amber-200 border border-amber-400/20">
                            {room.category}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          {isAvailableNow ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-600/90 text-white backdrop-blur">
                              Disponível Hoje
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-stone-900/80 text-stone-300 backdrop-blur">
                              Reservável p/ Datas Futuras
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-3 right-3 bg-stone-900/90 backdrop-blur px-3 py-1.5 rounded-xl text-white">
                          <span className="text-xs text-stone-300">diária a partir de</span>
                          <div className="text-lg font-bold text-amber-300">
                            R$ {room.price}
                          </div>
                        </div>
                      </div>

                      {/* Room Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-serif font-bold text-xl text-stone-900 leading-snug">
                            {room.name}
                          </h3>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                            {room.description}
                          </p>

                          {/* Quick specs */}
                          <div className="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-stone-100 text-xs text-stone-600">
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-amber-700" />
                              <span>Até {room.capacity} hóspedes</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <BedDouble className="w-3.5 h-3.5 text-amber-700" />
                              <span>{room.bed}</span>
                            </div>
                          </div>

                          {/* Amenities chips */}
                          <div className="flex flex-wrap gap-1.5 mb-6">
                            {room.amenities.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-md text-[11px] bg-stone-100 text-stone-600 font-medium"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Price summary & CTA */}
                        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-stone-500 block">Total ({calculatedNights} noites):</span>
                            <span className="text-xl font-bold text-stone-900 font-serif">
                              R$ {room.price * calculatedNights}
                            </span>
                          </div>
                          <button
                            onClick={() => handleOpenBooking(room)}
                            className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-semibold transition flex items-center gap-1.5 shadow-sm"
                          >
                            Reservar Agora
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Highlights & Experience */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
            <div className="bg-amber-900/10 rounded-3xl p-8 sm:p-12 border border-amber-900/20">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                  A Experiência Villa Serena
                </h3>
                <p className="text-stone-600 text-sm mt-2">
                  Cada detalhe é cuidadosamente preparado para proporcionar desconexão da rotina e reconexão com o bem-estar.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-stone-800">
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Coffee className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-base">Café Colonial Artesanal</h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Pães de fermentação natural, geleias de frutas colhidas na propriedade, bolos quentes e queijos da região.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Sun className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-base">Trilhas e Mirantes</h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Acesso privativo a nascentes de água pura, trilhas arborizadas para caminhadas e mirante do pôr do sol.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Wifi className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-base">Conexão & Conforto</h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Internet fibra de alta velocidade em todos os chalés, ideal caso precise trabalhar antes de relaxar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {}
      {activeTab === "admin" && (
        <main className="flex-1 bg-stone-100/60 pb-16">
          {/* Admin Navigation Sub-header */}
          <div className="bg-white border-b border-stone-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase bg-amber-100 text-amber-800 border border-amber-300">
                      Backoffice
                    </span>
                    <h2 className="text-xl font-bold font-serif text-stone-900">
                      Painel Operacional da Pousada
                    </h2>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Controle de ocupação em tempo real, fluxo de hóspedes e governança.
                  </p>
                </div>

                {/* Sub-menu buttons */}
                <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 self-start sm:self-auto">
                  <button
                    onClick={() => setAdminView("dashboard")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      adminView === "dashboard"
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    Visão Geral
                  </button>
                  <button
                    onClick={() => setAdminView("rooms")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      adminView === "rooms"
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    Quartos & Governança
                  </button>
                  <button
                    onClick={() => setAdminView("bookings")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      adminView === "bookings"
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    Todas as Reservas
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            {/* Quick KPI Stat Cards (Always visible or in dashboard) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Ocupação */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Taxa de Ocupação
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-serif text-stone-900">
                    {metrics.occupancyRate}%
                  </span>
                  <span className="text-xs text-stone-500">
                    ({metrics.occupiedCount} de {metrics.totalRooms} quartos)
                  </span>
                </div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${metrics.occupancyRate}%` }}
                  />
                </div>
              </div>

              {/* Check-ins Hoje */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Check-ins Hoje
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <LogIn className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold font-serif text-stone-900">
                    {metrics.todayCheckInsCount}
                  </span>
                  <span className="text-xs text-stone-500 block mt-0.5">
                    {metrics.todayCheckInsCount === 1 ? "Hóspede aguardado" : "Hóspedes aguardados"}
                  </span>
                </div>
              </div>

              {/* Check-outs Hoje */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Check-outs Hoje
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold font-serif text-stone-900">
                    {metrics.todayCheckOutsCount}
                  </span>
                  <span className="text-xs text-stone-500 block mt-0.5">
                    Liberações programadas
                  </span>
                </div>
              </div>

              {/* Faturamento em Reservas */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Receita Confirmada
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold font-serif text-stone-900">
                    R$ {metrics.activeRevenue.toLocaleString("pt-BR")}
                  </span>
                  <span className="text-xs text-stone-500 block mt-0.5">
                    {bookings.filter(b => b.status !== "cancelled").length} reservas ativas
                  </span>
                </div>
              </div>
            </div>

            {/* DASHBOARD TAB */}
            {adminView === "dashboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Actionable Today Arrivals & Departures */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Today arrivals */}
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <LogIn className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-serif font-bold text-lg text-stone-900">
                          Chegadas Previstas para Hoje
                        </h3>
                      </div>
                      <span className="text-xs text-stone-500">
                        {dateTodayStr}
                      </span>
                    </div>

                    {bookings.filter(b => b.checkIn === dateTodayStr && b.status === "confirmed").length === 0 ? (
                      <p className="text-sm text-stone-500 py-4 text-center bg-stone-50 rounded-xl">
                        Nenhum check-in pendente para o dia de hoje.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {bookings
                          .filter(b => b.checkIn === dateTodayStr && b.status === "confirmed")
                          .map(booking => (
                            <div
                              key={booking.id}
                              className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-stone-900 text-sm">{booking.guestName}</span>
                                  <span className="text-xs text-stone-400">({booking.id})</span>
                                </div>
                                <p className="text-xs text-stone-600 mt-0.5">
                                  {booking.roomName} • {booking.nights} noites • {booking.guestsCount} hóspedes
                                </p>
                                {booking.specialRequests && (
                                  <p className="text-[11px] text-amber-800 italic mt-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 inline-block">
                                    Nota: {booking.specialRequests}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, "checked_in")}
                                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Realizar Check-in
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Room Occupancy Visual Map */}
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <BedDouble className="w-5 h-5 text-amber-700" />
                        <h3 className="font-serif font-bold text-lg text-stone-900">
                          Quadro Visual de Acomodações
                        </h3>
                      </div>
                      <button
                        onClick={() => setAdminView("rooms")}
                        className="text-xs text-amber-700 font-semibold hover:underline"
                      >
                        Gerenciar todos
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {rooms.map(room => (
                        <div
                          key={room.id}
                          className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-mono font-bold text-stone-700 bg-stone-200/70 px-2 py-0.5 rounded">
                                {room.id}
                              </span>
                              {getStatusBadge(room.status)}
                            </div>
                            <h4 className="font-semibold text-xs text-stone-900 line-clamp-1">{room.name}</h4>
                            <p className="text-[11px] text-stone-500 mt-0.5">R$ {room.price}/noite</p>
                          </div>

                          {/* Quick status dropdown */}
                          <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between">
                            <span className="text-[11px] text-stone-400">Alterar:</span>
                            <select
                              value={room.status}
                              onChange={(e) => updateRoomStatus(room.id, e.target.value)}
                              className="text-xs py-1 px-2 rounded border border-stone-300 bg-white text-stone-700 focus:outline-none"
                            >
                              <option value="available">Disponível</option>
                              <option value="occupied">Ocupado</option>
                              <option value="cleaning">Limpeza</option>
                              <option value="maintenance">Manutenção</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right 1 Col: Cleaning & Fast Actions */}
                <div className="space-y-6">
                  {/* Housekeeping list */}
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-sky-600" />
                      <h3 className="font-serif font-bold text-lg text-stone-900">
                        Governança & Limpeza
                      </h3>
                    </div>

                    <div className="space-y-2.5">
                      {rooms.filter(r => r.status === "cleaning").length === 0 ? (
                        <p className="text-xs text-stone-500 py-3 text-center bg-stone-50 rounded-xl">
                          Nenhum quarto com limpeza pendente no momento! Tudo pronto.
                        </p>
                      ) : (
                        rooms
                          .filter(r => r.status === "cleaning")
                          .map(room => (
                            <div
                              key={room.id}
                              className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl flex items-center justify-between gap-2"
                            >
                              <div>
                                <span className="font-bold text-xs text-sky-950 block">{room.name}</span>
                                <span className="text-[11px] text-sky-700">{room.id}</span>
                              </div>
                              <button
                                onClick={() => updateRoomStatus(room.id, "available")}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition"
                              >
                                Pronto (Liberar)
                              </button>
                            </div>
                          ))
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-stone-100">
                      <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                        Resumo dos Quartos
                      </h4>
                      <div className="space-y-1.5 text-xs text-stone-600">
                        <div className="flex justify-between">
                          <span>Disponíveis:</span>
                          <span className="font-bold text-emerald-700">{metrics.availableCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ocupados:</span>
                          <span className="font-bold text-amber-700">{metrics.occupiedCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Limpeza:</span>
                          <span className="font-bold text-sky-700">{metrics.cleaningCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Manutenção:</span>
                          <span className="font-bold text-rose-700">{metrics.maintenanceCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pousada Quick Contact & Reception info */}
                  <div className="bg-stone-900 text-stone-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-serif font-bold text-white text-base mb-2">
                      Recepção Villa Serena
                    </h4>
                    <p className="text-xs text-stone-400 mb-4 leading-relaxed">
                      Atendimento ao hóspede das 07h00 às 22h00. Para emergências noturnas, acionar o ramal 009.
                    </p>
                    <div className="text-xs space-y-2 text-stone-300">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <span>(48) 3288-9900 • WhatsApp Comercial</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-amber-400" />
                        <span>reservas@pousadavillaserena.com.br</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ROOMS MANAGEMENT TAB */}
            {adminView === "rooms" && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-stone-900">
                      Catálogo de Quartos & Acomodações
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Configure tarifas diárias, descrições, fotos e status operacional.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenRoomModal(null)}
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Adicionar Quarto
                  </button>
                </div>

                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-3">Quarto</th>
                        <th className="py-3 px-3">Categoria</th>
                        <th className="py-3 px-3">Capacidade</th>
                        <th className="py-3 px-3">Diária Base</th>
                        <th className="py-3 px-3">Status Atual</th>
                        <th className="py-3 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {rooms.map(room => (
                        <tr key={room.id} className="hover:bg-stone-50 transition">
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={room.image}
                                alt={room.name}
                                className="w-12 h-10 object-cover rounded-lg border border-stone-200"
                              />
                              <div>
                                <span className="font-bold text-stone-900 block">{room.name}</span>
                                <span className="text-[11px] text-stone-400 font-mono">{room.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 font-medium">{room.category}</td>
                          <td className="py-3.5 px-3">{room.capacity} pessoas</td>
                          <td className="py-3.5 px-3 font-bold text-stone-900">
                            R$ {room.price}
                          </td>
                          <td className="py-3.5 px-3">
                            {getStatusBadge(room.status)}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenRoomModal(room)}
                                className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-stone-100 rounded-lg transition"
                                title="Editar Quarto"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BOOKINGS MANAGEMENT TAB */}
            {adminView === "bookings" && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-stone-200 gap-4">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-stone-900">
                      Todas as Reservas Registradas
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Gerencie check-ins, check-outs e cancelamentos de reservas ativas.
                    </p>
                  </div>

                  {/* Filters bar */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Buscar por hóspede ou cód..."
                        value={bookingSearchText}
                        onChange={(e) => setBookingSearchText(e.target.value)}
                        className="pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500 w-48 sm:w-56"
                      />
                    </div>

                    <select
                      value={bookingFilterStatus}
                      onChange={(e) => setBookingFilterStatus(e.target.value)}
                      className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-300 bg-white text-stone-700 focus:outline-none"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="confirmed">Confirmada</option>
                      <option value="checked_in">Check-in Realizado</option>
                      <option value="checked_out">Finalizada</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </div>
                </div>

                {/* Table of bookings */}
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-3">Cód. / Hóspede</th>
                        <th className="py-3 px-3">Acomodação</th>
                        <th className="py-3 px-3">Check-in / Out</th>
                        <th className="py-3 px-3">Noites</th>
                        <th className="py-3 px-3">Valor Total</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Ação Rápida</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {bookings
                        .filter(b => {
                          if (bookingFilterStatus !== "all" && b.status !== bookingFilterStatus) return false;
                          if (bookingSearchText.trim()) {
                            const query = bookingSearchText.toLowerCase();
                            const matchName = b.guestName.toLowerCase().includes(query);
                            const matchId = b.id.toLowerCase().includes(query);
                            return matchName || matchId;
                          }
                          return true;
                        })
                        .map(b => (
                          <tr key={b.id} className="hover:bg-stone-50 transition">
                            <td className="py-3.5 px-3">
                              <span className="font-mono font-bold text-amber-900 block">{b.id}</span>
                              <span className="font-semibold text-stone-900">{b.guestName}</span>
                              <span className="text-[11px] text-stone-400 block">{b.guestPhone}</span>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="font-medium text-stone-800">{b.roomName}</span>
                              <span className="text-[11px] text-stone-400 block">{b.guestsCount} hóspedes</span>
                            </td>
                            <td className="py-3.5 px-3 font-medium">
                              <div>{b.checkIn}</div>
                              <div className="text-stone-400 text-[11px]">até {b.checkOut}</div>
                            </td>
                            <td className="py-3.5 px-3 font-semibold">{b.nights}n</td>
                            <td className="py-3.5 px-3 font-bold text-stone-900">
                              R$ {b.totalPrice.toLocaleString("pt-BR")}
                            </td>
                            <td className="py-3.5 px-3">
                              {getBookingStatusBadge(b.status)}
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {b.status === "confirmed" && (
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, "checked_in")}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition"
                                  >
                                    Fazer Check-in
                                  </button>
                                )}
                                {b.status === "checked_in" && (
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, "checked_out")}
                                    className="px-2.5 py-1 bg-stone-700 hover:bg-stone-800 text-white rounded text-[11px] font-semibold transition"
                                  >
                                    Check-out
                                  </button>
                                )}
                                {b.status !== "cancelled" && b.status !== "checked_out" && (
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, "cancelled")}
                                    className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded text-[11px] font-medium transition"
                                  >
                                    Cancelar
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {}
      {selectedRoomForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedRoomForBooking(null)}
              className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                Reserva Imediata
              </span>
            </div>

            <h3 className="text-2xl font-serif font-bold text-stone-900">
              Confirmar Reserva
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              {selectedRoomForBooking.name} • {calculatedNights} {calculatedNights === 1 ? "diária" : "diárias"}
            </p>

            {/* Room breakdown box */}
            <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-500 block">Período Selecionado:</span>
                <span className="font-semibold text-stone-800">
                  {searchCheckIn} até {searchCheckOut}
                </span>
                <span className="block text-stone-400 mt-0.5">{searchGuests} Hóspedes</span>
              </div>
              <div className="text-right">
                <span className="text-stone-500 block">Total a pagar:</span>
                <span className="text-xl font-serif font-bold text-amber-800">
                  R$ {selectedRoomForBooking.price * calculatedNights}
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateBookingSubmit} className="mt-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nome Completo do Titular *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Dra. Mariana Albuquerque"
                  value={guestBookingForm.name}
                  onChange={(e) => setGuestBookingForm({ ...guestBookingForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    E-mail para Confirmação *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="mariana@exemplo.com"
                    value={guestBookingForm.email}
                    onChange={(e) => setGuestBookingForm({ ...guestBookingForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    WhatsApp / Telefone *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={guestBookingForm.phone}
                    onChange={(e) => setGuestBookingForm({ ...guestBookingForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Pedidos Especiais ou Restrições Alimentares (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Comemoração de aniversário de casamento, preferência por travesseiros extras..."
                  value={guestBookingForm.specialRequests}
                  onChange={(e) => setGuestBookingForm({ ...guestBookingForm, specialRequests: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Reserva garantida sem cobrança antecipada imediata. O pagamento pode ser feito no check-in via PIX ou Cartão de Crédito.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRoomForBooking(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 font-semibold hover:bg-stone-50 transition"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition"
                >
                  Concluir Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {confirmedBookingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-stone-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-serif font-bold text-stone-900">
              Reserva Confirmada!
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Aguardamos sua visita na Pousada Villa Serena.
            </p>

            {/* Voucher Box */}
            <div className="my-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-left text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-amber-200/60">
                <span className="text-stone-500">Código Localizador:</span>
                <span className="font-mono font-bold text-base text-amber-900">
                  {confirmedBookingResult.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Hóspede:</span>
                <span className="font-semibold text-stone-800">{confirmedBookingResult.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Quarto:</span>
                <span className="font-semibold text-stone-800">{confirmedBookingResult.roomName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Entrada / Saída:</span>
                <span className="font-semibold text-stone-800">{confirmedBookingResult.checkIn} → {confirmedBookingResult.checkOut}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-stone-900">
                <span>Total:</span>
                <span>R$ {confirmedBookingResult.totalPrice}</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-400 mb-6">
              Guarde este código para consulta ou para agilizar seu check-in na recepção.
            </p>

            <button
              onClick={() => setConfirmedBookingResult(null)}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition"
            >
              Fechar & Concluir
            </button>
          </div>
        </div>
      )}

      {}
      {showLookupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative">
            <button
              onClick={() => setShowLookupModal(false)}
              className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-stone-900 mb-1">
              Consultar Minha Reserva
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Informe o código localizador (ex: VS-8821) ou o e-mail utilizado na reserva.
            </p>

            <form onSubmit={handleLookupBooking} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Código ou E-mail..."
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" /> Buscar
              </button>
            </form>

            {lookupSearched && (
              <div className="mt-6">
                {lookupResult ? (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                      <span className="font-mono font-bold text-amber-900 text-sm">{lookupResult.id}</span>
                      {getBookingStatusBadge(lookupResult.status)}
                    </div>
                    <div className="text-stone-700">
                      <p className="font-bold text-sm text-stone-900">{lookupResult.guestName}</p>
                      <p className="text-stone-500">{lookupResult.roomName}</p>
                      <p className="mt-1">
                        <strong>Datas:</strong> {lookupResult.checkIn} até {lookupResult.checkOut} ({lookupResult.nights} noites)
                      </p>
                      <p>
                        <strong>Valor Total:</strong> R$ {lookupResult.totalPrice}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center">
                    Nenhuma reserva encontrada com os dados informados. Verifique e tente novamente.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsRoomModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-stone-900 mb-1">
              {editingRoom ? "Editar Acomodação" : "Cadastrar Nova Acomodação"}
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Ajuste as características do quarto para o portal e controle interno.
            </p>

            <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nome do Quarto</label>
                  <input
                    required
                    type="text"
                    value={roomFormData.name}
                    onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Código ID</label>
                  <input
                    disabled={!!editingRoom}
                    type="text"
                    value={roomFormData.id}
                    onChange={(e) => setRoomFormData({ ...roomFormData, id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800 bg-stone-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Categoria</label>
                  <select
                    value={roomFormData.category}
                    onChange={(e) => setRoomFormData({ ...roomFormData, category: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-stone-800 bg-white"
                  >
                    <option value="Suíte Master">Suíte Master</option>
                    <option value="Chalé Jardim">Chalé Jardim</option>
                    <option value="Suíte Romântica">Suíte Romântica</option>
                    <option value="Standard">Standard</option>
                    <option value="Família">Família</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Capacidade (Pessoas)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={roomFormData.capacity}
                    onChange={(e) => setRoomFormData({ ...roomFormData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Diária Base (R$)</label>
                  <input
                    type="number"
                    value={roomFormData.price}
                    onChange={(e) => setRoomFormData({ ...roomFormData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Status Operacional</label>
                  <select
                    value={roomFormData.status}
                    onChange={(e) => setRoomFormData({ ...roomFormData, status: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-stone-800 bg-white"
                  >
                    <option value="available">Disponível</option>
                    <option value="occupied">Ocupado</option>
                    <option value="cleaning">Limpeza Pendente</option>
                    <option value="maintenance">Manutenção</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">URL da Imagem</label>
                  <input
                    type="url"
                    value={roomFormData.image}
                    onChange={(e) => setRoomFormData({ ...roomFormData, image: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={roomFormData.description}
                  onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold shadow-sm"
                >
                  Salvar Acomodação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      <footer className="bg-stone-900 text-stone-400 py-10 border-t border-stone-800 mt-auto text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-amber-200">Villa Serena</span>
            <span>• Pousada & Refúgio Ecológico</span>
          </div>
          <div className="text-center sm:text-right text-stone-500">
            Painel Unificado para Hóspedes e Equipe de Governança
          </div>
        </div>
      </footer>
    </div>
  );
}