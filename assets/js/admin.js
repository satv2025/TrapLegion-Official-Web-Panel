(() => {
        'use strict';
        const $ = (s, r = document) => r.querySelector(s);
        const $$ = (s, r = document) => [...r.querySelectorAll(s)];
        const esc = s => String(s ? ? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        const safeUrl = u => { const s = String(u || ''); if (s.startsWith('/') && !s.startsWith('//')) return s; try { let x = new URL(s); return ['https:', 'http:'].includes(x.protocol) ? x.href : '' } catch { return '' } };
        const slugify = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const artistUrlSlug = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const TYPES = {
            artist_type: [
                ['humano', 'Artista'],
                ['personaje', 'Personaje'],
                ['ia', 'Proyecto IA'],
                ['grupo', 'Grupo'],
                ['otro', 'Otro']
            ],
            release_type: [
                ['single', 'Sencillo'],
                ['ep', 'EP'],
                ['album', 'Álbum'],
                ['compilacion', 'Recopilación'],
                ['mixtape', 'Mixtape'],
                ['otro', 'Otro']
            ],
            category: [
                ['noticia', 'Noticia'],
                ['comunicado', 'Comunicado'],
                ['lanzamiento', 'Lanzamiento'],
                ['artista', 'Artista'],
                ['otro', 'Otro']
            ],
            credit_role: [
                ['principal', 'Principal'],
                ['colaborador', 'Colaborador'],
                ['invitado', 'Invitado'],
                ['productor', 'Productor'],
                ['otro', 'Otro']
            ],
            role: [
                ['editor', 'Editor'],
                ['admin', 'Administrador'],
                ['owner', 'Propietario']
            ],
            status: [
                ['pending', 'Pendiente'],
                ['active', 'Activo'],
                ['unsubscribed', 'Desuscripto']
            ]
        };
        const FIELD = {
            artists: [
                ['name', 'Nombre artístico', 'text', 1],
                ['artist_type', 'Tipo de artista', 'select'],
                ['tagline', 'Etiqueta / titular', 'text'],
                ['short_bio', 'Presentación breve', 'area'],
                ['biography', 'Biografía completa', 'long'],
                ['country', 'País', 'text'],
                ['avatar_url', 'Imagen del artista', 'media'],
                ['banner_url', 'Banner del perfil', 'media'],
                ['featured', 'Destacado en portada', 'bool'],
                ['is_published', 'Perfil publicado', 'bool'],
                ['sort_order', 'Orden', 'number']
            ],
            releases: [
                ['title', 'Título del lanzamiento', 'text', 1],
                ['slug', 'Slug interno', 'text'],
                ['release_type', 'Tipo', 'select'],
                ['released_on', 'Fecha de lanzamiento (AAAA-MM-DD)', 'text'],
                ['release_year', 'Año', 'number'],
                ['description', 'Descripción', 'area'],
                ['credits_note', 'Notas de créditos', 'area'],
                ['cover_url', 'Portada', 'media'],
                ['gallery_urls', 'Otras imágenes del lanzamiento (una URL por línea)', 'list'],
                ['spotify_url', 'Enlace de Spotify', 'text'],
                ['apple_music_url', 'Enlace de Apple Music', 'text'],
                ['external_url', 'Otro enlace de escucha', 'text'],
                ['catalog_number', 'N.º de catálogo (opcional)', 'text'],
                ['upc', 'UPC (opcional)', 'text'],
                ['is_published', 'Publicado', 'bool'],
                ['featured', 'Destacado', 'bool'],
                ['sort_order', 'Orden', 'number']
            ],
            tracks: [
                ['track_number', 'Número de canción', 'number', 1],
                ['disc_number', 'Número de disco', 'number'],
                ['title', 'Título de la canción', 'text', 1],
                ['artwork_url', 'Portada individual de la canción', 'media'],
                ['duration_seconds', 'Duración en segundos', 'number'],
                ['isrc', 'ISRC', 'text'],
                ['spotify_url', 'Enlace Spotify', 'text'],
                ['apple_music_url', 'Enlace Apple Music', 'text'],
                ['external_url', 'Enlace alternativo', 'text'],
                ['is_explicit', 'Contenido explícito', 'bool']
            ],
            news: [
                ['title', 'Título', 'text', 1],
                ['slug', 'Slug', 'text'],
                ['category', 'Categoría', 'select'],
                ['excerpt', 'Resumen', 'area'],
                ['body_markdown', 'Contenido en Markdown (sin HTML)', 'long'],
                ['cover_url', 'Portada', 'media'],
                ['published_at', 'Fecha de publicación (AAAA-MM-DD HH:MM)', 'text'],
                ['is_published', 'Visible públicamente', 'bool']
            ],
            links: [
                ['artist_id', 'Artista', 'artist'],
                ['platform', 'Plataforma (Spotify, etc.)', 'text', 1],
                ['label', 'Texto visible', 'text'],
                ['url', 'URL https://', 'text', 1],
                ['sort_order', 'Orden', 'number'],
                ['is_public', 'Enlace público', 'bool']
            ],
            pages: [
                ['title', 'Título', 'text', 1],
                ['subtitle', 'Bajada', 'area'],
                ['body_markdown', 'Historia / contenido Markdown', 'long'],
                ['hero_image_url', 'Imagen principal', 'media'],
                ['is_published', 'Página publicada', 'bool']
            ],
            team: [
                ['user_id', 'UUID de Supabase Auth (creá la cuenta en Authentication)', 'text', 1],
                ['display_name', 'Nombre visible', 'text'],
                ['role', 'Rol de acceso', 'select']
            ]
        };
        const DEFAULTS = { artists: { artist_type: 'humano', is_published: false, featured: false, sort_order: 0 }, releases: { release_type: 'single', is_published: false, featured: false, sort_order: 0 }, tracks: { track_number: 1, disc_number: 1, is_explicit: false }, news: { category: 'noticia', is_published: false }, links: { sort_order: 0, is_public: true }, pages: { is_published: true }, team: { role: 'editor' } };
        const TABLE = { artists: 'tl_artists', releases: 'tl_releases', tracks: 'tl_tracks', news: 'tl_news', links: 'tl_artist_links', pages: 'tl_pages', team: 'tl_admins' };
        const NAV = [
            ['dashboard', '⌂', 'Inicio'],
            ['artists', '◉', 'Artistas'],
            ['releases', '◈', 'Nuevos lanzamientos'],
            ['tracks', '≡', 'Canciones'],
            ['links', '↗', 'Perfiles y enlaces'],
            ['news', '✳', 'Noticias'],
            ['pages', '¶', 'Historia'],
            ['media', '▣', 'Multimedia'],
            ['settings', '⚙', 'Web y plataformas'],
            ['newsletter', '✉', 'Newsletter'],
            ['team', '♟', 'Equipo']
        ];
        const cfg = window.TL_CONFIG || {};
        let sb, user, role = 'editor',
            view = 'dashboard',
            editor = null,
            filterRelease = '',
            artistCache = [],
            releaseCache = [],
            listCache = [],
            pendingConfirm = null,
            fileForField = null,
            toastTimeout;

        function notify(msg, error = false) {
            const n = $('#toast');
            n.textContent = msg;
            n.classList.remove('hidden');
            n.classList.toggle('error', error);
            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => n.classList.add('hidden'), 4800)
        }

        function messageError(e) {
            notify(e ? .message || String(e), true);
            console.error(e)
        }

        function configured() { return cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes('TU-PROYECTO') && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes('TU_ANON') }
        async function query(table, opts = {}) { let q = sb.from(table).select('*'); if (opts.eq) q = q.eq(opts.eq[0], opts.eq[1]); if (opts.order) q = q.order(opts.order, { ascending: opts.asc ? ? true }); let { data, error } = await q; if (error) throw error; return data || [] }
        async function loadCaches() {
            [artistCache, releaseCache] = await Promise.all([query('tl_artists', { order: 'name' }), query('tl_releases', { order: 'created_at', asc: false })])
        }
        const aName = id => artistCache.find(a => a.id === id) ? .name || 'Sin artista';
        const rName = id => releaseCache.find(r => r.id === id) ? .title || 'Sin lanzamiento';

        function visibleForNav(v) { if (['newsletter', 'settings'].includes(v)) return role === 'owner' || role === 'admin'; if (v === 'team') return role === 'owner'; return true }

        function activate(viewName) {
            view = viewName;
            $$('[data-nav]').forEach(el => el.classList.toggle('active', el.dataset.nav === view));
            $('#crumb').textContent = NAV.find(x => x[0] === view) ? .[2] || 'PANEL';
            loadView().catch(messageError)
        }

        function displayShell() {
            $('#login-screen').classList.add('hidden');
            $('#shell').classList.remove('hidden');
            $('#role-badge').textContent = role;
            $('#user-email').textContent = user.email || '';
            $('#sidebar-nav').innerHTML = NAV.filter(([v]) => visibleForNav(v)).map(([v, symbol, name]) => `<button class="menu-item" type="button" data-nav="${v}"><span class="symbol">${symbol}</span>${esc(name)}</button>`).join('');
            $$('[data-nav]').forEach(n => n.addEventListener('click', () => activate(n.dataset.nav)))
        }
        async function authenticate() {
            const { data, error } = await sb.auth.getUser();
            if (error || !data.user) {
                $('#shell').classList.add('hidden');
                $('#login-screen').classList.remove('hidden');
                return
            }
            const me = data.user;
            const { data: member, error: permissionError } = await sb.from('tl_admins').select('user_id,role,display_name').eq('user_id', me.id).maybeSingle();
            if (permissionError) throw permissionError;
            if (!member) {
                await sb.auth.signOut();
                $('#login-error').textContent = 'Tu cuenta existe, pero no tiene permiso en tl_admins. Asigná owner desde el SQL Editor.';
                return
            }
            user = me;
            role = member.role;
            displayShell();
            await loadCaches();
            activate('dashboard')
        }

        function pageHead(title, subtitle, button = '') { return `<div class="title-row"><div><h1 class="page-title">${esc(title)}</h1><p class="page-subtitle">${esc(subtitle)}</p></div>${button}</div>` }

        function badge(p) { return p ? '<span class="pill active">Publicado</span>' : '<span class="pill draft">Borrador</span>' }

        function actions(item, kind) { return `<div class="table-actions"><button type="button" class="tiny" data-edit="${esc(item.id||item.user_id||item.key)}" data-kind="${kind}">Editar</button>${kind==='releases'?`<button class="tiny" data-go-tracks="${esc(item.id)}">Temas</button>`:''}<button type="button" class="tiny red" data-delete="${esc(item.id||item.user_id)}" data-kind="${kind}">Eliminar</button></div>`}
function tables(list,kind){if(!list.length)return `<div class="dim-note">No hay registros en esta sección. Creá el primero desde el botón superior.</div>`;let rows='';if(kind==='artists')rows=list.map(x=>`<tr><td><div class="cell-title">${esc(x.name)}</div><small class="muted">/artist=${artistUrlSlug(x.name)}</small></td><td>${esc(x.artist_type)}</td><td>${badge(x.is_published)}</td><td>${actions(x,kind)}</td></tr>`).join('');
if(kind==='releases')rows=list.map(x=>`<tr><td><div class="cell-title">${esc(x.title)}</div><small class="muted">${esc(x.slug)}</small></td><td>${esc(x.release_type)} ${esc(x.release_year||'')}</td><td>${badge(x.is_published)}</td><td>${actions(x,kind)}</td></tr>`).join('');
if(kind==='tracks')rows=list.map(x=>`<tr><td>${esc(x.track_number)}</td><td><div class="cell-title">${esc(x.title)}</div></td><td>${esc(rName(x.release_id))}</td><td>${actions(x,kind)}</td></tr>`).join('');
if(kind==='news')rows=list.map(x=>`<tr><td><div class="cell-title">${esc(x.title)}</div></td><td>${esc(x.category)}</td><td>${badge(x.is_published)}</td><td>${actions(x,kind)}</td></tr>`).join('');
if(kind==='links')rows=list.map(x=>`<tr><td>${esc(aName(x.artist_id))}</td><td>${esc(x.platform)}</td><td><a class="accent" target="_blank" rel="noopener" href="${esc(safeUrl(x.url))}">${esc(x.label||x.url)} ↗</a></td><td>${actions(x,kind)}</td></tr>`).join('');
if(kind==='pages')rows=list.map(x=>`<tr><td><div class="cell-title">${esc(x.title)}</div></td><td>${esc(x.slug)}</td><td>${badge(x.is_published)}</td><td><button class="tiny" data-edit="${esc(x.id)}" data-kind="pages">Editar historia</button></td></tr>`).join('');
if(kind==='team')rows=list.map(x=>`<tr><td>${esc(x.display_name||'Sin nombre')}</td><td><small>${esc(x.user_id)}</small></td><td>${esc(x.role)}</td><td><button class="tiny" data-edit="${esc(x.user_id)}" data-kind="team">Editar</button>${x.user_id!==user.id?`<button class="tiny red" data-delete="${esc(x.user_id)}" data-kind="team">Quitar</button>`:''}</td></tr>`).join('');
const heads={artists:['Nombre','Tipo','Estado','Acciones'],releases:['Lanzamiento','Tipo / año','Estado','Acciones'],tracks:['N.º','Canción','Lanzamiento','Acciones'],news:['Título','Categoría','Estado','Acciones'],links:['Artista','Plataforma','Enlace','Acciones'],pages:['Página','Ruta','Estado','Acciones'],team:['Usuario','UUID','Rol','Acciones']}[kind];return `<div class="panel-table"><table><thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`}
function selectHTML(name,value,options){const entries=options||TYPES[name]||[];const label=entries.find(([v])=>String(v)===String(value))?.[1]||'Elegir';return `<div class="select-custom" data-select="${esc(name)}"><div class="select-trigger" role="button" tabindex="0" aria-expanded="false" data-select-trigger>${esc(label)}</div><div class="select-options" role="listbox">${entries.map(([v,t])=>`<div class="select-option ${String(v)===String(value)?'selected':''}" role="option" tabindex="0" data-select-option="${esc(v)}">${esc(t)}</div>`).join('')}</div></div>`}
function filterSelect(name,value,options){return `<div style="min-width:230px">${selectHTML(name,value,options)}</div>`}
function renderList(kind,rows){const label={artists:['ARTISTAS','Administrá perfiles, biografías, fotografías y publicación.','Nuevo artista'],releases:['NUEVOS LANZAMIENTOS','Publicá álbumes, EP y sencillos con portadas y créditos.','Nuevo lanzamiento'],tracks:['CANCIONES','Agregá y editá temas dentro de cada lanzamiento.','Nueva canción'],news:['NOTICIAS','Comunicados, publicaciones e información del sello.','Nueva noticia'],links:['PERFILES Y ENLACES','Conectá a cada artista con Spotify, Apple Music y más.','Nuevo enlace'],pages:['HISTORIA','Escribí y publicá la historia real del sello.',''],team:['EQUIPO','Usuarios registrados en Supabase Auth con acceso al panel.','Agregar miembro']}[kind];
return `${pageHead(label[0],label[1],label[2]?`<button type="button" class="primary" data-new="${kind}">+ ${label[2]}</button>`:'')}${kind==='tracks'?`<div class="toolbar">${filterSelect('release_filter',filterRelease||'',[['','Todos los lanzamientos'],...releaseCache.map(r=>[r.id,r.title])])}<span class="footnote">Primero creá el lanzamiento y luego cargá sus temas.</span></div>`:''}${tables(rows,kind)}`}
async function renderDashboard(){const [artists,releases,tracks,news]=await Promise.all([query('tl_artists'),query('tl_releases'),query('tl_tracks'),query('tl_news')]);$('#content').innerHTML=`${pageHead('PANEL TrapLegion','Administración real de tu catálogo. Todas las modificaciones se guardan en Supabase.')}<div class="stats"><div class="stat"><span>Artistas</span><b>${artists.length}</b><small>${artists.filter(a=>a.is_published).length} publicados</small></div><div class="stat"><span>Lanzamientos (NL)</span><b>${releases.length}</b><small>${releases.filter(r=>r.is_published).length} publicados</small></div><div class="stat"><span>Canciones</span><b>${tracks.length}</b><small>En discografía</small></div><div class="stat"><span>Noticias</span><b>${news.length}</b><small>${news.filter(n=>n.is_published).length} publicadas</small></div></div><section class="panel"><h3>Accesos rápidos</h3><div class="toolbar"><button class="primary" data-new="releases">+ Subir lanzamiento</button><button class="secondary" data-new="artists">+ Crear artista</button><button class="secondary" data-nav-jump="media">+ Subir portada</button></div><p>Solo se muestra en la web pública lo que esté marcado como publicado. Las imágenes se guardan en el bucket <strong>traplegion-media</strong>.</p></section><section class="panel"><h3>Últimos lanzamientos cargados</h3><div class="simple-list">${releases.slice().sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,6).map(r=>`<div class="simple-row"><div><strong>${esc(r.title)}</strong><small>${esc(r.release_year||'')} · ${r.is_published?'Publicado':'Borrador'}</small></div><button class="tiny" data-edit="${esc(r.id)}" data-kind="releases">Editar</button></div>`).join('')}</div></section>`}
async function renderMedia(){const items=await query('tl_media_assets',{order:'created_at',asc:false});$('#content').innerHTML=`${pageHead('MULTIMEDIA','Portadas, banners y retratos alojados en Supabase Storage.',`<button class="primary" data-upload-field="" data-upload-manual="1">+ Subir imagen</button>`)}<div class="dim-note">Admite JPG, PNG y WebP hasta 20 MB. Los archivos de este bucket son públicos. No subas material privado.</div><div class="panel"><h3>Archivos registrados (${items.length})</h3><div class="simple-list">${items.map(it=>`<div class="simple-row"><div style="display:flex;gap:13px;align-items:center"><img src="${esc(safeUrl(it.public_url))}" alt="" style="height:65px;width:80px;object-fit:cover;background:#211928"><div><strong>${esc(it.name)}</strong><small>${esc(it.public_url)}</small></div></div><button type="button" class="tiny" data-copy="${esc(it.public_url)}">Copiar URL</button></div>`).join('')||'<p class="muted">Sin imágenes cargadas.</p>'}</div></div>`}
async function renderNewsletter(){const items=await query('tl_newsletter_subscribers',{order:'created_at',asc:false});$('#content').innerHTML=`${pageHead('NEWSLETTER','Lista privada de suscriptores. La inscripción pública requiere una Edge Function con antispam y consentimiento.')}<div class="dim-note">El panel gestiona registros existentes. La web no incluye un formulario de newsletter público sin un endpoint validado.</div><div class="panel-table" style="margin-top:25px"><table><thead><tr><th>Correo</th><th>Estado</th><th>Alta</th><th>Actualizar</th></tr></thead><tbody>${items.map(x=>`<tr><td>${esc(x.email)}</td><td>${esc(x.status)}</td><td>${esc(new Date(x.created_at).toLocaleDateString('es-AR'))}</td><td><button class="tiny" data-newsletter-id="${esc(x.id)}" data-newsletter-status="${x.status==='unsubscribed'?'active':'unsubscribed'}">${x.status==='unsubscribed'?'Activar':'Desuscribir'}</button></td></tr>`).join('')}</tbody></table></div>`}
function settingsFields(key,fields,obj){return `<div class="panel" data-site-settings="${key}"><h3>${key==='home_hero'?'Portada y mensaje':key==='platforms'?'Plataformas oficiales':'Identidad del sitio'}</h3><div class="form-grid">${fields.map(([field,label])=>`<label class="field"><span>${label}</span><input class="control" data-site-field="${field}" value="${esc(obj[field]||'')}"></label>`).join('')}</div><div style="display:flex;justify-content:flex-end;margin-top:18px"><button type="button" class="primary" data-save-site="${key}">Guardar cambios</button></div></div>`}
async function renderSettings(){const items=await query('tl_site_settings');const byKey=k=>items.find(x=>x.key===k)?.value||{};$('#content').innerHTML=`${pageHead('WEB Y PLATAFORMAS','Editá mensajes y enlaces oficiales de la página web.')}<div class="dim-note">Estos valores se leen dinámicamente desde Supabase. No tenés que volver a desplegar el sitio para cambiar el texto.</div>${settingsFields('home_hero',[['eyebrow','Texto superior'],['title','Título'],['description','Descripción del hero']],byKey('home_hero'))}${settingsFields('platforms',[['spotify','Spotify'],['apple_music','Apple Music'],['youtube','YouTube'],['volt_fm','Otra plataforma / Volt.fm']],byKey('platforms'))}${settingsFields('identity',[['name','Nombre'],['origin','Origen'],['since_year','Año de inicio'],['domain','URL oficial']],byKey('identity'))}`}
async function loadView(){if(view==='dashboard')return renderDashboard();if(view==='media')return renderMedia();if(view==='settings')return renderSettings();if(view==='newsletter')return renderNewsletter();const kind=view;const items=await query(TABLE[kind],{order:kind==='team'?'created_at':kind==='pages'?'slug':'created_at',asc:kind==='pages'});listCache=items;$('#content').innerHTML=renderList(kind,kind==='tracks'&&filterRelease?items.filter(t=>t.release_id===filterRelease):items)}
function modalOpen(title,body,footer){$('#modal-title').textContent=title;$('#modal-body').innerHTML=body;$('#modal-foot').innerHTML=footer;$('#overlay').classList.add('open');$('#overlay').setAttribute('aria-hidden','false')}
function modalClose(){$('#overlay').classList.remove('open');$('#overlay').setAttribute('aria-hidden','true');editor=null;pendingConfirm=null}
function choiceItems(items,selected){return `<div class="check-list">${items.map(item=>`<div class="custom-check ${selected.has(item.id)?'active':''}" role="checkbox" tabindex="0" aria-checked="${selected.has(item.id)}" data-multi-artist="${esc(item.id)}"><span class="indicator">${selected.has(item.id)?'✓':''}</span><span>${esc(item.name)}</span></div>`).join('')}</div>`}
function fieldHTML(field){const [key,label,type,required]=field;const v=editor.values[key];const wide=['area','long','media'].includes(type);if(type==='bool')return `<div class="field ${wide?'wide':''}"><span>${esc(label)}</span><div class="toggle" role="switch" tabindex="0" aria-checked="${Boolean(v)}" data-toggle-value="${esc(key)}" data-on="${Boolean(v)}"><div class="toggle-indicator"></div><span>${Boolean(v)?'Activado':'Desactivado'}</span></div></div>`;
if(type==='select')return `<div class="field"><span>${esc(label)}</span>${selectHTML(key,v||'',TYPES[key])}</div>`;
if(type==='artist')return `<div class="field"><span>${esc(label)}</span>${selectHTML(key,v||'',artistCache.map(a=>[a.id,a.name]))}</div>`;
if(type==='media')return `<div class="field wide"><span>${esc(label)}</span><div class="media-control"><input data-field="${esc(key)}" class="control" placeholder="URL pública de imagen" value="${esc(v||'')}"><button type="button" class="secondary" data-upload-field="${esc(key)}">Subir imagen ↥</button></div>${safeUrl(v)?`<img class="thumb-preview" src="${esc(safeUrl(v))}" alt="Vista previa">`:''}</div>`;
if(type==='area'||type==='long'||type==='list')return `<label class="field wide"><span>${esc(label)}</span><textarea data-field="${esc(key)}" class="control area" style="min-height:${type==='long'||type==='list'?'290':'100'}px" ${required?'required':''}>${esc(type==='list'?(Array.isArray(v)?v.join('\n'):(v||'')):(v||''))}</textarea></label>`;
return `<label class="field"><span>${esc(label)}</span><input data-field="${esc(key)}" class="control" type="${type==='number'?'number':'text'}" ${required?'required':''} value="${esc(v??'')}"></label>`}
async function openEditor(kind,id=''){
 const table=TABLE[kind];if(!table)throw Error('Módulo no reconocido');let rec=null;
 if(id){const key=kind==='team'?'user_id':'id';const {data,error}=await sb.from(table).select('*').eq(key,id).single();if(error)throw error;rec=data}
 const values={...(DEFAULTS[kind]||{}),...(rec||{})};if(kind==='tracks'&&!rec){values.release_id=filterRelease||releaseCache[0]?.id||'';const existing=await query('tl_tracks',{eq:['release_id',values.release_id]});values.track_number=existing.reduce((m,x)=>Math.max(m,x.track_number),0)+1}
 if(kind==='links'&&!rec)values.artist_id=artistCache[0]?.id||'';
 let selected=new Set();if(rec&&['releases','tracks'].includes(kind)){const rel=kind==='releases'?'tl_release_artists':'tl_track_artists';const col=kind==='releases'?'release_id':'track_id';const credit=await query(rel,{eq:[col,id]});selected=new Set(credit.map(r=>r.artist_id))}
 editor={kind,id,values,selected};const title=rec?`EDITAR ${kind==='artists'?'ARTISTA':kind==='releases'?'LANZAMIENTO':kind==='tracks'?'CANCIÓN':kind==='news'?'NOTICIA':kind==='team'?'MIEMBRO':kind==='pages'?'HISTORIA':'ENLACE'}`:`NUEVO ${kind==='artists'?'ARTISTA':kind==='releases'?'LANZAMIENTO':kind==='tracks'?'TEMA':kind==='news'?'ARTÍCULO':kind==='team'?'MIEMBRO':'ENLACE'}`;
 let extra='';
 if(kind==='tracks'){extra=`<div class="section-label">Lanzamiento al que pertenece</div>${selectHTML('release_id',values.release_id||'',releaseCache.map(r=>[r.id,r.title]))}`}
 if(['releases','tracks'].includes(kind)){extra+=`<div class="section-label">Artistas acreditados</div>${choiceItems(artistCache,selected)}<p class="footnote">Seleccioná los nombres que realmente participan. Los créditos se relacionan mediante UUID internos; las URLs públicas siguen siendo por nombre.</p>`}
 if(kind==='pages')extra+='<p class="footnote">La historia admite títulos con ##, párrafos y negritas con **texto**. El HTML escrito dentro del texto no se ejecuta.</p>';
 const fields=FIELD[kind].filter(f=>!(kind==='team'&&id&&f[0]==='user_id'));
 modalOpen(title,`<div class="form-grid">${fields.map(fieldHTML).join('')}</div>${extra}`,`<button type="button" class="secondary" id="cancel-save">Cancelar</button><button type="button" class="primary" id="save-editor">Guardar en Supabase ↗</button>`);
 $('#save-editor').addEventListener('click',()=>saveEditor().catch(messageError));$('#cancel-save').addEventListener('click',modalClose);
}
function collectEditor(){if(!editor)return;$$('[data-field]',$('#modal-body')).forEach(input=>{const k=input.dataset.field;const field=FIELD[editor.kind].find(f=>f[0]===k);let value=input.value.trim();editor.values[k]=field?.[2]==='number'?(value===''?null:Number(value)):value||null});}
async function syncCredits(kind,id,selection){const tbl=kind==='releases'?'tl_release_artists':'tl_track_artists',key=kind==='releases'?'release_id':'track_id';const {error:delErr}=await sb.from(tbl).delete().eq(key,id);if(delErr)throw delErr;if(selection.length){const items=selection.map((aid,i)=>({[key]:id,artist_id:aid,credit_role:'principal',sort_order:i}));const {error:insErr}=await sb.from(tbl).insert(items);if(insErr)throw insErr}}
async function saveEditor(){if(!editor)return;collectEditor();let {kind,id,values,selected}=editor;const table=TABLE[kind];let payload={};for(const [key,,type,required] of FIELD[kind]){if(kind==='team'&&id&&key==='user_id')continue;let x=values[key];if(required && (x===null||x===undefined||String(x).trim()===''))throw Error('Falta completar: '+key);if(type==='media'&&x&& !safeUrl(x))throw Error('URL inválida en '+key);if(key==='url'&&x&&!safeUrl(x))throw Error('El enlace debe comenzar con https://');if(type==='list'){const rows=String(x||'').split(/\r?\n/).map(u=>u.trim()).filter(Boolean);if(rows.some(u=>!safeUrl(u)))throw Error('Cada imagen de la galería requiere una URL válida (https:// o /assets/...)');x=rows;}payload[key]=x??null}
if(kind==='artists'){payload.slug=artistUrlSlug(payload.name);if(!payload.slug)throw Error('El nombre debe contener letras o números para crear su URL.')}
if(['releases','news'].includes(kind)&&!payload.slug)payload.slug=slugify(payload.title);
if(kind==='news'){const d=payload.published_at;if(d){const dt=new Date(d.replace(' ','T'));if(Number.isNaN(dt.getTime()))throw Error('Fecha de publicación inválida');payload.published_at=dt.toISOString()}else if(payload.is_published)payload.published_at=new Date().toISOString();else payload.published_at=null}
if(kind==='releases'){if(payload.released_on && !/^\d{4}-\d{2}-\d{2}$/.test(payload.released_on))throw Error('Fecha de lanzamiento: usá AAAA-MM-DD');if(payload.release_year && (payload.release_year<1900||payload.release_year>2100))throw Error('Año fuera de rango');if(!payload.release_year&&payload.released_on)payload.release_year=Number(payload.released_on.slice(0,4));if(payload.is_published&&!selected.size)throw Error('Seleccioná al menos un artista acreditado antes de publicar.')}
if(kind==='tracks'){payload.release_id=values.release_id;if(!payload.release_id)throw Error('Seleccioná un lanzamiento');if(!payload.track_number||payload.track_number<1)throw Error('Número de canción inválido');if(!payload.disc_number)payload.disc_number=1}
if(kind==='team'&&id===user.id&&payload.role!=='owner')throw Error('No podés rebajar tu propio acceso owner desde el panel');
let response;if(id){response=await sb.from(table).update(payload).eq(kind==='team'?'user_id':'id',id).select().single()}else{response=await sb.from(table).insert(payload).select().single()}
if(response.error)throw response.error;const created=response.data;editor.id=created.id||created.user_id;
if(['releases','tracks'].includes(kind))await syncCredits(kind,editor.id,[...selected]);
const currentKind=kind;modalClose();await loadCaches();if(view===currentKind||view==='dashboard')await loadView();notify('Guardado correctamente en Supabase.');
}
function confirmAction(title,text,fn){pendingConfirm=fn;modalOpen(title,`<p>${esc(text)}</p><p class="footnote">Esta acción puede eliminar relaciones asociadas por las claves foráneas.</p>`,`<button class="secondary" id="confirm-cancel">Cancelar</button><button class="danger" id="confirm-yes">Confirmar eliminación</button>`);$('#confirm-cancel').addEventListener('click',modalClose);$('#confirm-yes').addEventListener('click',async()=>{try{await pendingConfirm?.();modalClose();await loadCaches();await loadView();notify('Registro eliminado.')}catch(e){messageError(e)}})}
async function deleteRecord(kind,id){if(kind==='team'&&id===user.id){notify('No podés eliminarte a vos mismo.',true);return}confirmAction('¿ELIMINAR REGISTRO?',`Vas a eliminar este registro de ${kind}. Esto no se puede deshacer.`,async()=>{const key=kind==='team'?'user_id':'id';const {error}=await sb.from(TABLE[kind]).delete().eq(key,id);if(error)throw error})}
async function uploadFile(file,target){if(!file)return;const allowed=['image/png','image/jpeg','image/webp'];if(!allowed.includes(file.type))throw Error('Usá un PNG, JPG o WebP.');if(file.size>20*1024*1024)throw Error('El máximo permitido es 20 MB.');const ext=({'image/png':'png','image/jpeg':'jpg','image/webp':'webp'})[file.type];const path=`${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${ext}`;notify('Subiendo imagen a Supabase Storage...');const {data,error}=await sb.storage.from('traplegion-media').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});if(error)throw error;const {data:publicData}=sb.storage.from('traplegion-media').getPublicUrl(data.path);const publicUrl=publicData.publicUrl;
 const {error:registerError}=await sb.from('tl_media_assets').insert({name:file.name,public_url:publicUrl,alt_text:file.name,kind:'imagen',is_public:true});if(registerError)throw new Error('Imagen subida, pero no registrada en biblioteca: '+registerError.message+' — URL: '+publicUrl);
 if(target&&editor){editor.values[target]=publicUrl;const inp=$(`[data-field="${target}"]`,$('#modal-body'));if(inp)inp.value=publicUrl;const field=inp?.closest('.field');if(field){let preview=$('.thumb-preview',field);if(!preview){preview=document.createElement('img');preview.className='thumb-preview';preview.alt='Vista previa';field.appendChild(preview)}preview.src=publicUrl}}
 else if(view==='media')await loadView();notify('Imagen subida. URL guardada en biblioteca.');}
async function saveSetting(key){const node=$(`[data-site-settings="${key}"]`);if(!node)throw Error('Bloque de configuración no encontrado');const rows=await query('tl_site_settings',{eq:['key',key]});const obj={...(rows[0]?.value||{})};$$('[data-site-field]',node).forEach(el=>{obj[el.dataset.siteField]=el.value.trim()});if(key==='identity'&&obj.since_year)obj.since_year=Number(obj.since_year);const {error}=await sb.from('tl_site_settings').upsert({key,value:obj,is_public:true},{onConflict:'key'});if(error)throw error;notify('Configuración guardada.');}
function wireDelegation(){document.addEventListener('click',async e=>{const target=e.target;
 const selTrigger=target.closest('[data-select-trigger]');const opt=target.closest('[data-select-option]');if(opt){const select=opt.closest('.select-custom');const key=select.dataset.select,value=opt.dataset.selectOption;select.querySelector('[data-select-trigger]').textContent=opt.textContent;select.querySelector('[data-select-trigger]').setAttribute('aria-expanded','false');$$('[data-select-option]',select).forEach(x=>x.classList.toggle('selected',x===opt));select.classList.remove('open');if(editor)editor.values[key]=value;if(key==='release_filter'){filterRelease=value;await loadView()}return}
 if(selTrigger){const sel=selTrigger.closest('.select-custom');$$('.select-custom.open').forEach(x=>{if(x!==sel)x.classList.remove('open')});sel.classList.toggle('open');selTrigger.setAttribute('aria-expanded',String(sel.classList.contains('open')));return}
 if(!target.closest('.select-custom'))$$('.select-custom.open').forEach(x=>x.classList.remove('open'));
 const toggle=target.closest('[data-toggle-value]');if(toggle&&editor){const key=toggle.dataset.toggleValue;editor.values[key]=!Boolean(editor.values[key]);toggle.dataset.on=String(editor.values[key]);toggle.setAttribute('aria-checked',String(editor.values[key]));toggle.querySelector('span').textContent=editor.values[key]?'Activado':'Desactivado';return}
 const multi=target.closest('[data-multi-artist]');if(multi&&editor){const id=multi.dataset.multiArtist;if(editor.selected.has(id))editor.selected.delete(id);else editor.selected.add(id);multi.classList.toggle('active',editor.selected.has(id));multi.setAttribute('aria-checked',String(editor.selected.has(id)));multi.querySelector('.indicator').textContent=editor.selected.has(id)?'✓':'';return}
 const fresh=target.closest('[data-new]');if(fresh){try{await openEditor(fresh.dataset.new)}catch(err){messageError(err)}return}
 const edit=target.closest('[data-edit]');if(edit){try{await openEditor(edit.dataset.kind,edit.dataset.edit)}catch(err){messageError(err)}return}
 const del=target.closest('[data-delete]');if(del){await deleteRecord(del.dataset.kind,del.dataset.delete);return}
 const tracks=target.closest('[data-go-tracks]');if(tracks){filterRelease=tracks.dataset.goTracks;activate('tracks');return}
 const jump=target.closest('[data-nav-jump]');if(jump){activate(jump.dataset.navJump);return}
 const upload=target.closest('[data-upload-field]');if(upload){fileForField=upload.dataset.uploadField||'';$('#file-input').value='';$('#file-input').click();return}
 const copy=target.closest('[data-copy]');if(copy){try{await navigator.clipboard.writeText(copy.dataset.copy);notify('URL copiada.')}catch(err){messageError(err)}return}
 const site=target.closest('[data-save-site]');if(site){try{await saveSetting(site.dataset.saveSite)}catch(err){messageError(err)}return}
 const sub=target.closest('[data-newsletter-id]');if(sub){try{const status=sub.dataset.newsletterStatus;const {error}=await sb.from('tl_newsletter_subscribers').update({status}).eq('id',sub.dataset.newsletterId);if(error)throw error;await loadView();notify('Estado actualizado.')}catch(err){messageError(err)}return}
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){$$('.select-custom.open').forEach(x=>x.classList.remove('open'));if($('#overlay').classList.contains('open'))modalClose();return}const el=e.target;if((e.key==='Enter'||e.key===' ')&&el.matches('[data-select-trigger],[data-select-option],[data-toggle-value],[data-multi-artist]')){e.preventDefault();el.click()}});
 $('#modal-close').addEventListener('click',modalClose);$('#overlay').addEventListener('click',e=>{if(e.target===$('#overlay'))modalClose()});$('#file-input').addEventListener('change',async e=>{try{await uploadFile(e.target.files?.[0],fileForField)}catch(err){messageError(err)}});
 $('#logout-btn').addEventListener('click',async()=>{await sb.auth.signOut();location.reload()});
 $('#login-form').addEventListener('submit',async e=>{e.preventDefault();$('#login-error').textContent='';const btn=$('#login-form button');btn.disabled=true;btn.textContent='Autenticando...';try{const {error}=await sb.auth.signInWithPassword({email:$('#login-email').value.trim(),password:$('#login-password').value});if(error)throw error;await authenticate()}catch(err){$('#login-error').textContent=err.message||'No se pudo ingresar.'}finally{btn.disabled=false;btn.textContent='Entrar al panel ↗'}})
}
async function init(){wireDelegation();if(!configured()){$('#login-error').innerHTML='Primero completá <strong>assets/js/config.js</strong> con la URL y clave pública del mismo proyecto Supabase utilizado por la web.';$('#login-form button').disabled=true;return}if(!window.supabase?.createClient){$('#login-error').textContent='No se pudo cargar la librería Supabase desde jsDelivr.';return}sb=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);try{await authenticate()}catch(e){messageError(e);$('#login-error').textContent=e.message||'Error de conexión'}}
init();
})();