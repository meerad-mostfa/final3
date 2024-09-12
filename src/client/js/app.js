import  calculateDaysDiff  from './calculateDaysDiff';
document.getElementById("add-trip-button").addEventListener("click", async () => {
  const city = document.getElementById("trip-city").value;
  const url = `http://api.geonames.org/searchJSON?q=${city}&maxRows=1&username=meeradabdo`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();

    const tripDateStart = document.getElementById("trip-date").value;
    const tripDateEnd = document.getElementById("end-date").value;
    const { countryName, lat, lng: lon } = data?.geonames[0] || {};

    const trip = {
      city,
      country: countryName,
      latitude: lat,
      longitude: lon,
      date: tripDateStart,
      endDate: tripDateEnd,
    };
    updateUI(trip, false, null);
  } catch (error) {
    console.error("Error fetching city data:", error);
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("http://localhost:3000/all");
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    data.forEach(trip => updateUI(trip, true, trip.id));
  } catch (error) {
    console.error("Error fetching trips:", error);
  }
});

async function fetchImageURL(city, country) {
  const pixabayKey = process.env.pixabayKey;
  const imageFetchURL = `https://pixabay.com/api/?key=45814151-c21703a535953e2d8fe24487f&q=Tourist+places+in+${city}+${country}&image_type=photo`;

  try {
    const response = await fetch(imageFetchURL);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    return data.hits.length > 0 ? data.hits[0].largeImageURL : null;
  } catch (error) {
    console.error("Error fetching image URL:", error);
    return null;
  }
}

async function fetchWeatherStatus(lat, lon) {

  const WeatherFetchUrl = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&days=7&key=23b7aff43a7f453880ec7339fad67f50`;

  try {
    const response = await fetch(WeatherFetchUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching weather status:", error);
    return null;
  }
}

async function updateUI(trip, saved, id) {
  const tripCard = document.createElement("div");
  tripCard.className = "trip-card";

  const tripDate = new Date(trip.date);
  const endDate = new Date(trip.endDate);
  const currentDate = new Date();
  const daysAway = Client.calculateDaysDiff(currentDate, trip.date);
  const tripLength = Client.calculateDaysDiff(trip.date, trip.endDate);

  const imageurl = await fetchImageURL(trip.city, trip.country);
  const weather = await fetchWeatherStatus(trip.latitude, trip.longitude);

  tripCard.innerHTML = `
    <img src="${imageurl || 'default-image-url.jpg'}" alt="${trip.city}, ${trip.country}" class="trip-image" />
    <div class="trip-details">
      <p><strong>My trip to:</strong> ${trip.city}, ${trip.country}</p>
      <p><strong>Departing:</strong> ${trip.date} <strong>to:</strong> ${trip.endDate}</p>
      <p><strong>Trip length:</strong> ${tripLength} days</p>
      <div class="trip-buttons">
        ${saved ? `<button class="remove-trip">Remove Trip</button>` : `<button class="save-trip">Save Trip</button>`}
      </div>
      <p class="trip-info">${trip.city}, ${trip.country} is ${daysAway} days away</p>
      ${daysAway < 7 && daysAway > 0 ? `
        <p class="trip-weather">
          Typical weather on ${weather?.data[daysAway]?.datetime} is:<br />
          Max temperature: ${weather?.data[daysAway]?.app_max_temp} °C, Min temperature: ${weather?.data[daysAway]?.app_min_temp} °C<br />
          ${weather?.data[daysAway]?.weather?.description}
        </p>
      ` : `<p>Weather data is available for 7 days or less</p>`}
      <div class="list">
        <div class="list-item" id="add-item">
          <p>Add to-do item<span>+</span></p>
        </div>
        ${trip.list ? trip.list.map(item => `<div class="list-item"><p>${item}</p></div>`).join('') : ''}
      </div>
    </div>
  `;

  document.getElementById("travel-cont").appendChild(tripCard);

  tripCard.querySelector(".save-trip")?.addEventListener("click", async () => {
    const listItems = Array.from(tripCard.querySelectorAll(".list-item p"))
      .filter((_, index) => index > 0)
      .map(item => item.textContent);
    const tripData = { ...trip, list: listItems };

    try {
      const response = await fetch("http://localhost:3000/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripData),
      });
      const data = await response.json();
      tripCard.querySelector(".trip-buttons").innerHTML = `<button class="remove-trip">Remove Trip</button>`;
      addRemoveTripListener(tripCard, data.id);
    } catch (error) {
      console.error("Error saving trip:", error);
    }
  });

  tripCard.querySelector(".list-item").addEventListener("click", () => {
    const newItemText = prompt("Enter a new to-do item:");
    if (newItemText) {
      const newListItem = document.createElement("div");
      newListItem.className = "list-item";
      const newP = document.createElement("p");
      newP.textContent = newItemText;
      newListItem.appendChild(newP);
      tripCard.querySelector(".list").appendChild(newListItem);
      if (id) {
        tripCard.querySelector(".trip-buttons").innerHTML = `<button class="update-list">Update Trip</button>`;
        updateTrip(tripCard, trip, id);
      }
    }
  });

  if (saved) {
    addRemoveTripListener(tripCard, trip.id);
  }
}

function addRemoveTripListener(tripCard, tripId) {
  if (!tripId) {
    throw new Error("tripId must be provided");
  }
  tripCard.querySelector(".remove-trip").addEventListener("click", async () => {
    try {
      const response = await fetch(`http://localhost:3000/delete/${tripId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      tripCard.remove();
    } catch (error) {
      console.error("Error removing trip:", error);
    }
  });
}

function updateTrip(tripCard, trip, id) {
  tripCard.querySelector(".update-list").addEventListener("click", async () => {
    const listItems = Array.from(tripCard.querySelectorAll(".list-item p"))
      .filter((_, index) => index > 0)
      .map(item => item.textContent);
    const updatedTripData = { ...trip, list: listItems };

    try {
      const response = await fetch(`http://localhost:3000/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTripData),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      const data = await response.json();
      tripCard.querySelector(".trip-buttons").innerHTML = `<button class="remove-trip">Remove Trip</button>`;
      addRemoveTripListener(tripCard, data.id);
    } catch (error) {
      console.error("Error updating trip:", error);
    }
  });
}
