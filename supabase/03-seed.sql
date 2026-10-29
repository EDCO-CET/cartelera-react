-- =============================================================
-- Datos iniciales: los mismos eventos de src/data/eventos.json.
-- Sin id: Postgres los numera 1, 2, 3... en este orden.
-- =============================================================

insert into public.eventos (titulo, descripcion, categoria, fecha, lugar, precio, cupos, imagen, alt, destacado) values
  ('Concierto de jazz', 'Big band en vivo en el Teatro Colón', 'Música', 'Viernes 2 de octubre, 8 pm',
   'Teatro Colón', 50000, 3, '/img/jazz.jpg', 'Fila de saxofonistas tocando en un concierto', true),
  ('Festival Indie Bogotá', 'Doce bandas, dos escenarios y food trucks', 'Música', 'Sábado 10 de octubre, 2 pm',
   'Parque Simón Bolívar', 120000, 5, '/img/festival.jpg', 'Público con las manos arriba frente a un escenario iluminado', false),
  ('Taller de fotografía', 'Fundamentos de luz y composición con cámara analógica', 'Taller', 'Martes 13 de octubre, 6 pm',
   'Casa Cultural La Candelaria', 80000, 2, '/img/fotografia.jpg', 'Cámara analógica antigua sobre una mesa', false),
  ('Feria gastronómica', 'Cocina local, mercado campesino y showcooking', 'Gastronomía', 'Domingo 18 de octubre, 11 am',
   'Plaza de Mercado de Paloquemao', 0, 10, '/img/cocina.jpg', 'Cebollas, hierbas y especias sobre una tabla de madera', false),
  ('Hackathon Frontend', '48 horas para construir una app web en equipo', 'Tecnología', 'Viernes 23 de octubre, 5 pm',
   'Universidad de los Andes', 30000, 4, '/img/tecnologia.jpg', 'Portátil abierto junto a un cuaderno de notas', false),
  ('Noche de vinilos', 'Sesión de DJ con clásicos del soul y el funk', 'Música', 'Sábado 31 de octubre, 9 pm',
   'Bar Latino, Chapinero', 25000, 1, '/img/vinilos.jpg', 'Aguja de un tocadiscos sobre un vinilo', false);
