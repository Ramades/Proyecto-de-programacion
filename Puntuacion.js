function mostrarMejoresPuntuaciones() {
    // Obtener los datos desde el localStorage
    let puntuaciones = JSON.parse(localStorage.getItem('jugadores')) || [];

    // Ordenar las puntuaciones de mayor a menor
    puntuaciones.sort((a, b) => b.punt - a.punt);

    // Limitar a las 10 mejores puntuaciones
    puntuaciones = puntuaciones.slice(0, 10);

    // Crear la tabla HTML
    let tabla = '<table border="1">';
    tabla += '<tr><th>Nombre</th><th>Puntuación</th></tr>';

    // Rellenar la tabla con las puntuaciones
    puntuaciones.forEach(puntuacion => {
        tabla += `<tr><td>${puntuacion.nom}</td><td>${puntuacion.punt}</td></tr>`;
    });

    tabla += '</table>';

    // Mostrar la tabla en el DOM (por ejemplo, en un elemento con id 'tabla-puntuaciones')
    document.getElementById('tabla-puntuaciones').innerHTML = tabla;
}