const menu = [
  { nombre: 'Bruschetta Clásica',     descripcion: 'Pan tostado con tomate y albahaca fresca',    precio: 4500,  categoria: 'Entrada'      },
  { nombre: 'Tabla de Quesos',         descripcion: 'Selección de quesos importados con mermelada', precio: 7800,  categoria: 'Entrada'      },
  { nombre: 'Lomo al Vino Tinto',      descripcion: 'Lomo de res en reducción de vino tinto',       precio: 15500, categoria: 'Plato Fuerte' },
  { nombre: 'Pasta Carbonara',         descripcion: 'Pasta con tocino, huevo y queso parmesano',    precio: 10200,  categoria: 'Plato Fuerte' },
  { nombre: 'Salmón a la Plancha',     descripcion: 'Filete de salmón con vegetales al vapor',      precio: 13800, categoria: 'Plato Fuerte' },
  { nombre: 'Tiramisú',               descripcion: 'Postre italiano con café y mascarpone',          precio: 5200,  categoria: 'Postre'       },
  { nombre: 'Cheesecake de Maracuyá', descripcion: 'Cheesecake cremoso con coulis de maracuyá',    precio: 4800,  categoria: 'Postre'       },
];

const reservas = [];

const menuContainer = document.getElementById('menu-container');
const botonesCategoria = document.querySelectorAll('.boton-categoria');
const formulario = document.getElementById('form-reserva');
const inputNombre = document.getElementById('nombre');
const inputCorreo = document.getElementById('correo');
const inputFecha = document.getElementById('fecha');
const inputHora = document.getElementById('hora');
const inputPersonas = document.getElementById('personas');
const botonEnviar = document.getElementById('boton-enviar');
const reservasTbody = document.getElementById('reservas-tbody');
const resumenContenedor = document.getElementById('resumen-reservas');

const errores = {
  nombre: document.getElementById('error-nombre'),
  correo: document.getElementById('error-correo'),
  fecha: document.getElementById('error-fecha'),
  hora: document.getElementById('error-hora'),
  personas: document.getElementById('error-personas'),
};

const confirmacionContenedor = document.getElementById('confirmacion-reserva');

const camposTocados = {
  nombre: false,
  correo: false,
  fecha: false,
  hora: false,
  personas: false,
};

function marcarTocado(campo) {
  camposTocados[campo] = true;
}

// Convierte un número de colones en formato de moneda local con puntos separadores.
function formatearPrecio(valor) {
  return '₡' + valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Genera las cards del menú y las agrega al DOM usando createElement.
function renderMenu(categoria = 'Todos') {
  menuContainer.innerHTML = '';
  const platillos = categoria === 'Todos'
    ? menu
    : menu.filter((item) => item.categoria === categoria);

  if (platillos.length === 0) {
    const mensaje = document.createElement('p');
    mensaje.textContent = 'No hay platillos disponibles en esa categoría.';
    menuContainer.appendChild(mensaje);
    return;
  }

  platillos.forEach((plato) => {
    const card = document.createElement('article');
    card.className = 'card-plato';

    const nombre = document.createElement('h3');
    nombre.textContent = plato.nombre;

    const descripcion = document.createElement('p');
    descripcion.textContent = plato.descripcion;

    const precioCategoria = document.createElement('div');
    precioCategoria.className = 'precio-categoria';

    const precio = document.createElement('span');
    precio.className = 'precio';
    precio.textContent = formatearPrecio(plato.precio);

    const categoriaLabel = document.createElement('span');
    categoriaLabel.className = 'categoria';
    categoriaLabel.textContent = plato.categoria;

    precioCategoria.appendChild(precio);
    precioCategoria.appendChild(categoriaLabel);

    card.appendChild(nombre);
    card.appendChild(descripcion);
    card.appendChild(precioCategoria);

    menuContainer.appendChild(card);
  });
}

// Ajusta el estado visual del botón seleccionado.
function actualizarCategoriaActiva(categoria) {
  botonesCategoria.forEach((boton) => {
    boton.classList.toggle('activo', boton.dataset.categoria === categoria);
  });
}

// Filtra el menú por categoría y actualiza los botones.
function filtrarCategoria(categoria) {
  renderMenu(categoria);
  actualizarCategoriaActiva(categoria);
}

// Elimina todos los mensajes de error visibles.
function limpiarErrores() {
  Object.values(errores).forEach((elemento) => {
    elemento.textContent = '';
  });
}

function mostrarError(campo, mensaje) {
  errores[campo].textContent = mensaje;
}

// Valida todos los campos obligatorios y actualiza el estado del botón.
function validarFormulario() {
  let esValido = true;
  limpiarErrores();

  const nombre = inputNombre.value.trim();
  const correo = inputCorreo.value.trim();
  const fecha = inputFecha.value;
  const hora = inputHora.value;
  const personas = Number(inputPersonas.value);

  if (nombre.length < 5 || !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/.test(nombre)) {
    if (camposTocados.nombre) {
      mostrarError('nombre', 'Nombre obligatorio, mínimo 5 caracteres y solo letras y espacios.');
    }
    esValido = false;
  }

  if (!correo || !/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(correo)) {
    if (camposTocados.correo) {
      mostrarError('correo', 'Correo inválido. Ingrese una dirección válida.');
    }
    esValido = false;
  }

  if (!fecha) {
    if (camposTocados.fecha) {
      mostrarError('fecha', 'La fecha de reserva es obligatoria.');
    }
    esValido = false;
  } else {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSeleccionada = new Date(fecha + 'T00:00');
    if (fechaSeleccionada < hoy) {
      if (camposTocados.fecha) {
        mostrarError('fecha', 'La fecha no puede ser anterior a hoy.');
      }
      esValido = false;
    }
  }

  if (!hora) {
    if (camposTocados.hora) {
      mostrarError('hora', 'La hora es obligatoria.');
    }
    esValido = false;
  }

  if (!inputPersonas.value || Number.isNaN(personas) || personas < 1 || personas > 20) {
    if (camposTocados.personas) {
      mostrarError('personas', 'Número de personas entre 1 y 20.');
    }
    esValido = false;
  }

  botonEnviar.disabled = !esValido;
  return esValido;
}

// Crea una fila de tabla para una reserva y aplica estilo si el grupo es grande.
function crearFilaReserva(reserva) {
  const fila = document.createElement('tr');
  fila.className = 'fila-reserva';

  if (reserva.personas >= 6) {
    fila.classList.add('grande');
  }

  const datos = [reserva.nombre, reserva.correo, reserva.fecha, reserva.hora, reserva.personas];
  datos.forEach((texto) => {
    const celda = document.createElement('td');
    celda.textContent = texto;
    fila.appendChild(celda);
  });

  return fila;
}

// Muestra un mensaje de confirmación en el DOM después de una reserva exitosa.
function mostrarConfirmacion(mensaje) {
  if (confirmacionContenedor) {
    confirmacionContenedor.textContent = mensaje;
  }
}

// Limpia el mensaje de confirmación visible.
function limpiarConfirmacion() {
  if (confirmacionContenedor) {
    confirmacionContenedor.textContent = '';
  }
}

// Agrega una nueva reserva a la tabla y actualiza el resumen.
function agregarReserva() {
  if (!validarFormulario()) {
    return;
  }

  const nuevaReserva = {
    nombre: inputNombre.value.trim(),
    correo: inputCorreo.value.trim(),
    fecha: inputFecha.value,
    hora: inputHora.value,
    personas: Number(inputPersonas.value),
  };

  reservas.push(nuevaReserva);
  const fila = crearFilaReserva(nuevaReserva);
  reservasTbody.appendChild(fila);

  formulario.reset();
  botonEnviar.disabled = true;
  mostrarConfirmacion('Reserva agregada con éxito.');
  actualizarResumen();
}

// Actualiza el resumen de reservas registrado debajo de la tabla.
function actualizarResumen() {
  const totalReservas = reservas.length;
  const totalPersonas = reservas.reduce((acum, reserva) => acum + reserva.personas, 0);
  const reservaMayor = reservas.reduce((actual, reserva) => {
    if (!actual || reserva.personas > actual.personas) {
      return reserva;
    }
    return actual;
  }, null);

  resumenContenedor.innerHTML = '';

  const titulo = document.createElement('h3');
  titulo.textContent = 'Resumen de reservas';
  resumenContenedor.appendChild(titulo);

  const totalReservasTexto = document.createElement('p');
  totalReservasTexto.innerHTML = `<strong>Total de reservas:</strong> ${totalReservas}`;
  resumenContenedor.appendChild(totalReservasTexto);

  const totalPersonasTexto = document.createElement('p');
  totalPersonasTexto.innerHTML = `<strong>Total de personas esperadas:</strong> ${totalPersonas}`;
  resumenContenedor.appendChild(totalPersonasTexto);

  const reservaMayorTexto = document.createElement('p');
  reservaMayorTexto.innerHTML = `<strong>Reserva con mayor número de personas:</strong> ${reservaMayor ? `${reservaMayor.nombre} (${reservaMayor.personas} personas)` : 'Aún no hay reservas'}`;
  resumenContenedor.appendChild(reservaMayorTexto);
}

document.addEventListener('DOMContentLoaded', function () {
  renderMenu();
  actualizarCategoriaActiva('Todos');
  actualizarResumen();

  botonesCategoria.forEach((boton) => {
    boton.addEventListener('click', () => {
      filtrarCategoria(boton.dataset.categoria);
    });
  });

  [
    {field: 'nombre', element: inputNombre},
    {field: 'correo', element: inputCorreo},
    {field: 'fecha', element: inputFecha},
    {field: 'hora', element: inputHora},
    {field: 'personas', element: inputPersonas},
  ].forEach(({ field, element }) => {
    element.addEventListener('input', () => {
      marcarTocado(field);
      validarFormulario();
    });
    element.addEventListener('change', () => {
      marcarTocado(field);
      validarFormulario();
    });
    element.addEventListener('blur', () => {
      marcarTocado(field);
      validarFormulario();
    });
  });

  validarFormulario();
});

document.getElementById('form-reserva').addEventListener('submit', function (e) {
  e.preventDefault(); // Evitar recarga de página
  agregarReserva();
});
