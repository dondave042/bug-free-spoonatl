  const saveFlight = useCallback(
    async (f: Flight) => {
      if (!isAdmin || !supabase) { notify("Admin access required", "error"); return false; }
      const isExisting = flights.some((flight) => flight.id === f.id);
      const flightRow = {
        airline: f.airline,
        departure_city: f.departure_city,
        arrival_city: f.arrival_city,
        departure_date: f.departure_date || null,
        arrival_date: f.arrival_date || null,
        price: f.price,
        available_seats: f.available_seats,
        duration: f.duration,
        stops: f.stops,
      };
      const query = isExisting
        ? supabase.from("flights").update(flightRow).eq("id", f.id)
        : supabase.from("flights").insert(flightRow);
      const { data, error } = await query.select().single();
      if (error || !data) { notify("Could not save flight", "error"); return false; }
      const savedFlight = data as Flight;
      setFlights((list) => isExisting ? list.map((x) => x.id === f.id ? savedFlight : x) : [savedFlight, ...list]);
      notify("Flight published");
      return true;
    },
    [flights, isAdmin, notify],
  );
