let savedRow: Flight | null = null;

if (isExisting) {
  const { data, error } = await supabase
    .from("flights")
    .update(flightRow)
    .eq("id", f.id)
    .select()
    .maybeSingle();

  if (error) {
    notify(`Could not save flight: ${error.message}`, "error");
    return false;
  }
  savedRow = data as Flight | null;
}

if (!savedRow) {
  const { data, error } = await supabase
    .from("flights")
    .insert(flightRow)
    .select()
    .single();

  if (error || !data) {
    notify(`Could not save flight: ${error?.message ?? "No flight returned"}`, "error");
    return false;
  }
  savedRow = data as Flight;
}

const savedFlight = savedRow;
setFlights((list) =>
  list.some((item) => item.id === f.id)
    ? list.map((item) => (item.id === f.id ? savedFlight : item))
    : [savedFlight, ...list],
);
notify("Flight published");
return true;
