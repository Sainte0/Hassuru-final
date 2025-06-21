const { Resend } = require('resend');

// Solo inicializar Resend si existe la API key
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.log('RESEND_API_KEY no configurada, emails deshabilitados');
}

async function sendOrderReceiptEmail({ to, order }) {
  console.log('📧 Intentando enviar email de comprobante a:', to);
  
  if (!resend) {
    console.log('❌ Resend no configurado, saltando envío de email al cliente');
    return;
  }

  if (!to || !order) {
    console.log('❌ Datos faltantes para enviar email:', { to, order: !!order });
    return;
  }

  // Construir el HTML del comprobante
  const productosHtml = order.productos.map(p => `
    <tr>
      <td>${p.nombre}${p.talle ? ' (Talle: ' + p.talle + ')' : ''}</td>
      <td>${p.cantidad}</td>
      <td>$${p.precio} USD</td>
    </tr>
  `).join('');

  const html = `
    <h2>¡Gracias por tu pedido, ${order.datosPersonales.nombre}!</h2>
    <p>Este es el comprobante de tu pedido en Hassuru.</p>
    <h3>Resumen del pedido</h3>
    <table border="1" cellpadding="6" style="border-collapse:collapse;">
      <thead>
        <tr><th>Producto</th><th>Cantidad</th><th>Precio</th></tr>
      </thead>
      <tbody>
        ${productosHtml}
      </tbody>
    </table>
    <p><strong>Total:</strong> $${order.productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0)} USD</p>
    <h4>Datos de envío</h4>
    <p>Tipo: ${order.envio.tipo === 'envio' ? 'Envío a domicilio' : 'Retiro en persona'}</p>
    ${order.envio.direccion ? `<p>Dirección: ${order.envio.direccion}</p>` : ''}
    <h4>Datos personales</h4>
    <p>Nombre: ${order.datosPersonales.nombre}</p>
    <p>Email: ${order.datosPersonales.email}</p>
    <p>Teléfono: ${order.datosPersonales.telefono}</p>
    <p>DNI: ${order.datosPersonales.dni}</p>
    <p>Gracias por confiar en Hassuru. Te contactaremos pronto para coordinar el pago y la entrega.</p>
  `;

  try {
    console.log('📧 Enviando email de comprobante con datos:', {
      from: 'Hassuru <onboarding@resend.dev>',
      to,
      subject: 'Comprobante de tu pedido en Hassuru'
    });
    
    const result = await resend.emails.send({
      from: 'Hassuru <onboarding@resend.dev>',
      to,
      subject: 'Comprobante de tu pedido en Hassuru',
      html
    });
    
    console.log('✅ Email de comprobante enviado exitosamente:', result);
    return result;
  } catch (error) {
    console.error('❌ Error enviando email de comprobante:', error);
    console.error('Detalles del error:', {
      message: error.message,
      status: error.status,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
}

async function sendNewOrderNotification({ order }) {
  if (!resend) {
    console.log('Resend no configurado, saltando envío de notificación a Hassuru');
    return;
  }

  const hassuruEmail = process.env.HASSURU_EMAIL || 'hassuru.ar@gmail.com';
  
  // Construir el HTML de la notificación
  const productosHtml = order.productos.map(p => `
    <tr>
      <td>${p.nombre}${p.talle ? ' (Talle: ' + p.talle + ')' : ''}</td>
      <td>${p.cantidad}</td>
      <td>$${p.precio} USD</td>
    </tr>
  `).join('');

  const total = order.productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  const html = `
    <h2>🛒 ¡HOY SE COME PAPAAAA!</h2>
    <p>Prepara el pedido culeaaaa.</p>
    
    <h3>📋 Detalles del naziii</h3>
    <p><strong>Nombre:</strong> ${order.datosPersonales.nombre}</p>
    <p><strong>Email:</strong> ${order.datosPersonales.email}</p>
    <p><strong>Teléfono:</strong> ${order.datosPersonales.telefono}</p>
    <p><strong>DNI:</strong> ${order.datosPersonales.dni}</p>
    
    <h3>📦 Información de Envío</h3>
    <p><strong>Tipo:</strong> ${order.envio.tipo === 'envio' ? 'Envío a domicilio' : 'Retiro en persona'}</p>
    ${order.envio.direccion ? `<p><strong>Dirección:</strong> ${order.envio.direccion}</p>` : ''}
    
    <h3>💳 Método de Pago</h3>
    <p><strong>Forma de pago:</strong> ${order.pago.toUpperCase()}</p>
    
    <h3>🛍️ Productos del Pedido</h3>
    <table border="1" cellpadding="6" style="border-collapse:collapse;">
      <thead>
        <tr><th>Producto</th><th>Cantidad</th><th>Precio</th></tr>
      </thead>
      <tbody>
        ${productosHtml}
      </tbody>
    </table>
    
    <h3>💰 Total del Pedido</h3>
    <p><strong>Total:</strong> $${total.toFixed(2)} USD</p>
    
    <h3>📅 Información del Pedido</h3>
    <p><strong>ID del pedido:</strong> ${order._id}</p>
    <p><strong>Fecha:</strong> ${new Date(order.fechaCreacion).toLocaleString('es-AR')}</p>
    
    <hr>
    <p><em>Este es un mensaje automático del sistema de pedidos de Hassuru.</em></p>
  `;

  return resend.emails.send({
    from: 'Hassuru <onboarding@resend.dev>',
    to: hassuruEmail,
    subject: `🛒 Nuevo Pedido - ${order.datosPersonales.nombre} - $${total.toFixed(2)} USD`,
    html
  });
}

// Función de prueba específica para email del cliente
async function testClientEmail(email) {
  console.log('🧪 Probando envío de email al cliente:', email);
  
  if (!resend) {
    console.log('❌ Resend no está configurado');
    return false;
  }

  try {
    const testResult = await resend.emails.send({
      from: 'Hassuru <onboarding@resend.dev>',
      to: email,
      subject: 'Test de email al cliente - Hassuru',
      html: `
        <h2>🧪 Test de Email</h2>
        <p>Este es un email de prueba para verificar que la configuración funciona correctamente.</p>
        <p><strong>Email de destino:</strong> ${email}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-AR')}</p>
        <p>Si recibes este email, significa que la configuración está funcionando correctamente.</p>
      `
    });
    console.log('✅ Test de email al cliente exitoso:', testResult);
    return true;
  } catch (error) {
    console.error('❌ Test de email al cliente falló:', error);
    return false;
  }
}

module.exports = { sendOrderReceiptEmail, sendNewOrderNotification, testClientEmail }; 