// Configura Supabase (reemplaza con tus claves reales de supabase.com)
const supabaseUrl = 'postgresql://postgres:[12345]@db.jpzczqmdhphjrlnhuwwi.supabase.co:5432/postgres';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwemN6cW1kaHBoanJsbmh1d3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MTAzNTIsImV4cCI6MjA3OTE4NjM1Mn0.MC9r8DhAEH4nCu44WXjYsqj7lALbruipDfX5xQoWupk';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Precios fijos
const precios = { limpieza: 50, extraccion: 100, ortodoncia: 200 };

// Calcular subtotal, IVA y total
function calcularPago() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    let subtotal = 0;
    checkboxes.forEach(cb => subtotal += parseFloat(cb.value));
    const iva = subtotal * 0.12;
    const total = subtotal + iva;
    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('iva').textContent = iva.toFixed(2);
    document.getElementById('total').textContent = total.toFixed(2);
}

// Verificar disponibilidad
document.getElementById('verificarBtn').addEventListener('click', async () => {
    const fecha = document.getElementById('fecha').value;
    if (!fecha) return alert('Selecciona una fecha.');
    const { data, error } = await supabase.from('citas').select('*').eq('fecha', fecha);
    if (error) return alert('Error al verificar: ' + error.message);
    const disponible = data.length === 0;
    document.getElementById('disponibilidad').textContent = disponible ? 'Disponible' : 'No disponible (ya hay cita)';
    document.getElementById('disponibilidad').style.color = disponible ? 'green' : 'red';
});

// Actualizar cálculo en tiempo real
document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.addEventListener('change', calcularPago));

// Enviar formulario (agendar cita)
document.getElementById('consultaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fecha = document.getElementById('fecha').value;
    const paciente = `${document.getElementById('nombre').value} ${document.getElementById('apellido').value}`;
    const servicios = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.dataset.service);
    if (!fecha || servicios.length === 0) return alert('Completa todos los campos.');
    const { error } = await supabase.from('citas').insert([{ fecha, paciente, servicios: JSON.stringify(servicios) }]);
    if (error) alert('Error al agendar: ' + error.message);
    else alert('Consulta agendada exitosamente.');
});
