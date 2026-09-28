// Renders room cards fetched from /api/rooms.
// Shows 2 separate images for each room.

// ----------------------------------------------------
// ROOM GALLERY
// ----------------------------------------------------

const ROOM_GALLERY = {

  Standard: [
    'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],

  Deluxe: [
    'https://images.pexels.com/photos/261388/pexels-photo-261388.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],

  Family: [
    'https://images.pexels.com/photos/2029719/pexels-photo-2029719.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],

  Suite: [
    'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=800'
  ]

};

// ----------------------------------------------------
// FALLBACK ROOM DATA
// ----------------------------------------------------

const FALLBACK_ROOMS = [

  {
    id: 1,
    name: 'Standard Single Room',
    type: 'Standard',
    description: 'A cozy room perfect for solo travelers, with all essential amenities.',
    price_per_night: 50000.00,
    image_url: ROOM_GALLERY.Standard
  },

  {
    id: 2,
    name: 'Deluxe Double Room',
    type: 'Deluxe',
    description: 'Spacious room with a king-size bed, city view, and modern decor.',
    price_per_night: 62000.00,
    image_url: ROOM_GALLERY.Deluxe
  },

  {
    id: 3,
    name: 'Executive Suite',
    type: 'Suite',
    description: 'Luxurious suite with a separate living area and premium furnishings.',
    price_per_night: 85000.00,
    image_url: ROOM_GALLERY.Suite
  },

  {
    id: 4,
    name: 'Family Room',
    type: 'Family',
    description: 'Large room designed for families, with extra bedding and space to relax.',
    price_per_night: 75000.00,
    image_url: ROOM_GALLERY.Family
  },

  {
    id: 5,
    name: 'Presidential Suite',
    type: 'Suite',
    description: 'Our finest suite with panoramic views, a private lounge, and chandelier lighting.',
    price_per_night: 100000.00,
    image_url: ROOM_GALLERY.Suite
  }

];


// ----------------------------------------------------
// RENDER ROOMS
// ----------------------------------------------------

async function renderRooms(containerId, { limit, type } = {}) {

  const container = document.getElementById(containerId);

  if (!container) return;

  container.innerHTML =
    '<p class="loading-msg">Loading rooms…</p>';

  let rooms;

  try {

    const query = type
      ? `?type=${encodeURIComponent(type)}`
      : '';

    rooms = await apiRequest(`/rooms${query}`);

  } catch (err) {

    // Use fallback data if backend/database is unavailable

    rooms = type
      ? FALLBACK_ROOMS.filter(room => room.type === type)
      : FALLBACK_ROOMS;

  }

  if (limit) {
    rooms = rooms.slice(0, limit);
  }

  if (rooms.length === 0) {

    container.innerHTML =
      '<p class="empty-msg">No rooms match this filter yet.</p>';

    return;
  }

  container.innerHTML =
    rooms.map(roomCardHTML).join('');

}


// ----------------------------------------------------
// ROOM CARD
// ----------------------------------------------------
function roomCardHTML(room) {

  let galleryImages = [];

  // Give different images to each room
  if (room.name === 'Executive Suite') {

    galleryImages = [
      'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=800'
    ];

  } else if (room.name === 'Presidential Suite') {

    galleryImages = [
      'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg?auto=compress&cs=tinysrgb&w=800'
    ];

  } else {

    galleryImages = ROOM_GALLERY[room.type] || [];

  }

  return galleryImages.map((image, index) => {

    return `
      <article class="room-card">

        <div class="thumb">
          <img
            src="${image}"
            alt="${room.name} ${index + 1}"
            loading="lazy"
          >
        </div>

        <div class="body">

          <div class="type-tag">
            ${room.type}
          </div>

          <h3>${room.name}</h3>

          <p class="desc">
            ${room.description}
          </p>

          <div class="meta">

            <div class="price">
              ${formatCurrency(room.price_per_night)}
              <small>/ night</small>
            </div>

            <a
              class="view-link"
              href="booking.html?room=${room.id}">
              Book room
            </a>

          </div>

        </div>

      </article>
    `;

  }).join('');

}

// ----------------------------------------------------
// ROOM FILTER BUTTONS
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {

  const filterBar =
    document.querySelector('.filter-bar');

  if (!filterBar) return;


  filterBar.addEventListener('click', (e) => {

    const btn =
      e.target.closest('.filter-btn');

    if (!btn) return;


    // Remove active from all buttons

    filterBar
      .querySelectorAll('.filter-btn')
      .forEach(button => {
        button.classList.remove('active');
      });


    // Add active to clicked button

    btn.classList.add('active');


    // Get selected room type

    const type =
      btn.dataset.type === 'all'
        ? undefined
        : btn.dataset.type;


    // Render selected rooms

    renderRooms('rooms-grid', { type });

  });

});