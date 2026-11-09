if (isExisting) {
  const { data, error } = await supabase
    .from("flights")
    .update(flightRow)
    .eq("id", f.id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // no row found -> insert instead
    } else {
      notify(`Could not save flight: ${error.message}`, "error");
      return false;
    }
  } else {
    savedRow = data as Flight;
  }
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
