import type { Booking, Room } from "@/lib/types";

export function buildMetrics(rooms: Room[], bookings: Booking[], today: string) {
  const occupiedCount = rooms.filter(
    (room) => room.operational_status === "occupied",
  ).length;
  const cleaningCount = rooms.filter(
    (room) => room.operational_status === "cleaning",
  ).length;
  const maintenanceCount = rooms.filter(
    (room) => room.operational_status === "maintenance",
  ).length;
  const availableCount = rooms.filter(
    (room) => room.operational_status === "available",
  ).length;
  const activeBookings = bookings.filter((booking) => booking.status !== "cancelled");

  return {
    totalRooms: rooms.length,
    occupiedCount,
    cleaningCount,
    maintenanceCount,
    availableCount,
    occupancyRate:
      rooms.length > 0 ? Math.round((occupiedCount / rooms.length) * 100) : 0,
    todayCheckIns: bookings.filter(
      (booking) => booking.check_in === today && booking.status === "confirmed",
    ),
    todayCheckOuts: bookings.filter(
      (booking) =>
        booking.check_out === today && booking.status === "checked_in",
    ),
    activeRevenue: activeBookings.reduce(
      (total, booking) => total + booking.total_price,
      0,
    ),
    activeBookingCount: activeBookings.length,
  };
}
