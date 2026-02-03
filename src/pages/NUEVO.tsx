<div className="space-y-2">
  <Label htmlFor="caballoId">
    Caballo
    {/* Mostrar si tiene caballo predeterminado */}
    {(() => {
      const alumno = alumnos.find(
        (a: Alumno) => a.id === Number(alumnoIdSeleccionado),
      );
      if (alumno?.caballoId) {
        const caballo = caballos.find(
          (c: Caballo) => c.id === alumno.caballoId,
        );
        return caballo ? (
          <span className="ml-2 text-xs font-medium text-success">
            ✓ Predeterminado: {caballo.nombre}
          </span>
        ) : null;
      }
      return null;
    })()}
  </Label>
  <Select
    name="caballoId"
    required
    defaultValue={
      claseToEdit
        ? String(claseToEdit.caballoId)
        : prefilledCaballoId
          ? String(prefilledCaballoId)
          : (() => {
              const alumno = alumnos.find(
                (a: Alumno) => a.id === Number(alumnoIdSeleccionado),
              );
              return alumno?.caballoId ? String(alumno.caballoId) : undefined;
            })()
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
