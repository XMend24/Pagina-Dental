document.addEventListener('DOMContentLoaded', () => {
    // Configura Supabase (verifica claves)
    const supabaseUrl = 'https://jpzczqmdhphjrlnhuwwi.supabase.co'
    const supabaseKey = process.env.SUPABASE_KEY
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);
    
    console.log('Supabase inicializado:', supabase);  // Para debugging
    
    // Precios fijos
    const precios = { limpieza: 50, extraccion: 100, ortodoncia: 200 };
    
    // Función para calcular pago
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
        try {
            const { data, error } = await supabase.from('citas').select('*').eq('fecha', fecha);
            if (error) {
                console.error('Error al verificar:', error);
                return alert('Error al verificar: ' + error.message);
            }
            const disponible = data.length === 0;
            document.getElementById('disponibilidad').textContent = disponible ? 'Disponible' : 'No disponible (ya hay cita)';
            document.getElementById('disponibilidad').style.color = disponible ? 'green' : 'red';
        } catch (err) {
            console.error('Error de red:', err);
        }
    });
    
    // Actualizar cálculo en tiempo real
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.addEventListener('change', calcularPago));
    
    // Agendar cita
    document.getElementById('consultaForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fecha = document.getElementById('fecha').value;
        const paciente = `${document.getElementById('nombre').value} ${document.getElementById('apellido').value}`;
        const servicios = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.dataset.service);
        
        console.log('Datos a insertar:', { fecha, paciente, servicios });  // Debugging
        
        if (!fecha || servicios.length === 0) return alert('Completa todos los campos.');
        
        try {
            const { data, error } = await supabase.from('citas').insert([{ fecha, paciente, servicios: JSON.stringify(servicios) }]);
            console.log('Respuesta de Supabase:', data, error);  // Debugging
            
            if (error) {
                console.error('Error al agendar:', error);
                alert('Error al agendar: ' + error.message);
            } else {
                alert('Consulta agendada exitosamente.');
                document.getElementById('consultaForm').reset();
            }
        } catch (err) {
            console.error('Error de red:', err);
            alert('Error de conexión: ' + err.message);
        }
    });
});
