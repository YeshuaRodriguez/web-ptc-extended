import MiniHero from "@/components/Layout/MiniHero"
import NuestrosServiciosOL from "@/components/NuestrosServiciosOL"
import nuestrosServiciosHero from "@/assets/img/hero/nuestrosservicioshero.jpg"

export default function NuestrosServicios(){

    return(

        <>
            <div id="titulo"></div>
            <MiniHero titulo="Nuestros Servicios" descripcion="Descubre el portafolio de soluciones diseñadas para optimizar, asegurar y potenciar cada una de tus transacciones." imgsrc={nuestrosServiciosHero}/>
        
            <div className="grid grid-cols-1 md:grid-cols-3 m-10 text-text-primary">

                    <NuestrosServiciosOL titulo="Comercial" items={[
                        'Prospectación de clientes',
                        'Venta de tarjetas de crédito',
                        'Ventas de productos vinculados a las tarjetas',
                        'Cross selling',
                        'Administración de portafolio',
                        'Estrategias de ciclo de vida',
                        'Elaboración de presupuestos de ventas',
                        'Multicanalidad para la colocación de los diferentes productos',
                        'Análisis de rentabilidad para nuevos productos y campañas',
                        'Reglas de negocio para productos y campañas',
                        'Análisis de productos y campañas existentes para realizar mejoras y ajustes',
                        'Desarrollo de nuevos productos'
                    ]}/>

                <NuestrosServiciosOL titulo="Mercadeo" items={[
                    'Estrategia de promociones y alianzas',
                    'Elaboración y ejecución de promociones, incentivos de consumo, reactivación y retenciones',
                    'Comunicación a clientes sobre promociones y beneficios',
                    'Relación comercial con las marcas',
                    'Benchmarks',
                    'Tendencia del consumidor',
                    'Artes de plásticos',
                    ]}/>

                <div className="p-10">

                    <NuestrosServiciosOL titulo="Call Center" items={[
                        'Ventas de tarjetas de crédito',
                        'Ventas de extrafinanciamiento',
                        'Ventas de productos vinculados',
                        'Campaña de retenciones',
                        'Atención a clientes inbound',
                        'Atención a agencias bancarias',
                        'Aprovechamiento de inbound para crosselling',
                        'Atención otros canales (página web, IVR)',
                        'Gestión de cobranza',
                        'Confirmación de transacciones sospechosas',
                        'Atención de gestiones',
                    ]}/>

                </div>

                <div className="p-10">

                    <NuestrosServiciosOL titulo="Créditos" items={[
                        'Brindar insights para la toma oportuna de decisiones concernientes al otorgamiento de tarjeta de crédito y productos asociados',
                        'Propuestas de reglamentos para el otorgamiento de tarjeta de crédito y sus subproductos',
                        'Elaboración y administración de reglas de crédito',
                        'Aumentos y disminución de límite de crédito temporal y permanente según políticas',
                        'Gestiones no monetarias',
                        'Bloqueos por fraude/robo/extravío',
                        'Aprobación de tarjeta de crédito',
                        'Activación de tarjeta de crédito',
                        'Custodio de expedientes físicos y digitales',
                        'Generación de finiquitos',
                        'Análisis del comportamiento histórico de la cartera de crédito',
                        'Asesoría en perfil del cliente y producto',
                        'Propuesta de línea de crédito por tipo de producto y clientes',
                    ]}/>

                </div>

                <div className="p-10">

                    <NuestrosServiciosOL titulo="Cobros" items={[
                        'Gestión de cobranza',
                        'Recuperación de cartera castigada',
                        'Presupuesto de rehabilitación, contagio y reservas',
                        'Campañas de actualización de datos',
                        'Recolección de pagos a domicilio',
                        'Realizar proceso de cobro con comunicación asertiva y empatía',
                        'Uso de campañas call blasting, premora, mora 30',
                        'Marcación predictiva',
                        'Whatsapp cobros',
                        'Campañas de actualización de datos',
                        'Aplicación de políticas de descuentos',
                        'Definición de KPIs',

                    ]}/>

                </div>

                                <div className="p-10">

                    <NuestrosServiciosOL titulo="Inteligencia de negocios" items={[
                        'Generar indicadores de portafolio para conocer el comportamiento de la cartera',
                        'Proveer insights a cada área de acuerdo a sus necesidades',
                        'Administración de bases de datos',
                        'Construir estructuras de datos para lograr agilidad en los análisis',
                        'Requerimientos y aseguramiento de calidad en implementaciones',
                        'Optimización de procesos existentes',
                        'Mejora continua en productos y campañas existentes',
                        'Manejo del portafolio de proyectos acorde a la prioridad definida y capacidad'
                    ]}/>

                </div>            
         
                
            </div>
        </>

    )

}