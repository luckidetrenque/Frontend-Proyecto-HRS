<div className="space-y-2">
  <Label htmlFor="caballoId">Caballo</Label>
  <Select
    name="caballoId"
    required
    defaultValue={
      claseToEdit
        ? String(claseToEdit.caballoId)
        : prefilledCaballoId
          ? String(prefilledCaballoId)
          : undefined
    }
  >
    <SelectTrigger>
      <SelectValue placeholder="Seleccionar caballo" />
    </SelectTrigger>
    <SelectContent>
      {caballos
        .filter((c: Caballo) => c.disponible)
        .map((caballo: Caballo) => (
          <SelectItem key={caballo.id} value={String(caballo.id)}>
            {caballo.nombre} (
            {caballo.tipo === "ESCUELA" ? "Escuela" : "Privado"})
          </SelectItem>
        ))}
    </SelectContent>
  </Select>
</div>;
