const URL = 'https://ada-backtrek-api.herokuapp.com/trips/';

//
// Report Status and Errors to User
//
const reportStatus = (message) => {
  $('#status-message').html(message)
};

const reportError = (message, errors) => {
  let content = `<p>${message}</p><ul>`;
  for (const field in errors) {
    for (const problem of errors[field]) {
      content += `<li> ${field}: ${problem}<li>`;
    }
  }
  content += '</ul>';
  reportStatus(content)
};

//
// Load all Trips
//
const loadTrips = () => {
  reportStatus('Please wait, we\'re gathering our Trips...');

  const tripList = $('#trip-list');
  const detailsTitle = $('#details-title');
  tripList.empty();

  axios.get(URL)
  .then((response) => {
    reportStatus(`Successfully loaded ${response.data.length} trips`);
    detailsTitle.html('Select a trip to view details');
    response.data.forEach((trip) => {
      tripList.append(
        `
        <tr>
        <td id="trip">
        <a href='https://ada-backtrek-api.herokuapp.com/trips/${trip.id}'>${trip.name}</a>
        </td>
        </tr>
        `
      );
    });
  })
  .catch((error) => {
    reportStatus(`Error loading trips: ${error.message}`);
    console.log(error);
  });
};

//
// View Trip Details
//
const loadDetails = function loadDetails(event) {
  reportStatus('Loading trip data...');
  event.preventDefault();
  const tripLink = event.currentTarget.getAttribute('href');
  const detailsTitle = $('#details-title');
  const tripDetails = $('#trip-details');
  const tripFormLocation = $('#trip-form-location');

  axios.get(tripLink)
  .then((response) => {
    reportStatus('Trip Details successfully retrieved.');
    detailsTitle.css('display', 'block');
    const trip = response.data;
    tripDetails.empty();
    tripDetails.html(
      `
      <h3 id='details-title'>Trip Details</h3>
      <ul>
      <li><span class='bold'>Name:</span>   ${trip.name}</li>
      <li><span class='bold'>Trip id:</span>   ${trip.id}</li>
      <li><span class='bold'>Continent:</span>   ${trip.continent}</li>
      <li><span class='bold'>Category:</span>   ${trip.category}</li>
      <li><span class='bold'>Trip Length:</span>   ${trip.weeks}</li>
      <li><span class='bold'>Price:</span>   $${trip.cost}</li>
      <li><span class='bold'>Description:</span><br> ${trip.about}</li>
      </ul>
      `
    );
    tripDetails.addClass('background');
    tripFormLocation.html(
      `
      <form method="post" id="trip-form">
      <h3>Reserve Trip: ${trip.name}</h3>
      <div>
      <label for="name">Name</label>
      <input type="text" name="name" />
      </div>

      <div>
      <label for="email">Email</label>
      <input type="email" name="email" />
      </div>

      <div>
      <input type="hidden" name="id" value="${trip.id}">
      </div>

      <button id="trip-btn" type="submit" form="trip-form" name="new-trip" value="Reserve">Reserve</button>
      </form>
      `
    );

    tripFormLocation.addClass('background');
  })
  .catch((error) => {
    reportStatus ( `Error loading trip: ${error.message}`);
    console.log(error);
  });
};

//
// Read Reservation Form
//
const getFormData = () => {
  const getName = () => {
    const nameInput = $('#trip-form input[name="name"]').val();
    return nameInput ? nameInput : undefined;
  };
  const getEmail = email => {
    const emailInput = $('#trip-form input[name="email"]').val();
    return emailInput ? emailInput : undefined;
  };
  const getId = id => {
    const idInput = $('#trip-form input[name="id"]').val();
    return idInput ? idInput : undefined;
  };

  const formData = {};
  formData['name'] = getName();
  formData['email'] = getEmail();
  formData['id'] = getId();

  return formData;
};

const clearForm = () => {
  $('#trip-form input[name="name"]').val('');
  $('#trip-form input[name="email"]').val('');
};

const reserveTrip = (event) => {
  event.preventDefault();

  const tripData = getFormData();
  const tripURL = `https://ada-backtrek-api.herokuapp.com/trips/${tripData.id}/reservations`;
  console.log(tripData);

  reportStatus('Reserving your trip...');

  axios.post(tripURL, tripData)
  .then((response) => {
    reportStatus(`Trip successfully reserved`);
    clearForm();
  })
  .catch((error) => {
    reportStatus ( `Error reserving trip: ${error.message}`);
    console.log(error);
  });
};

$(document).ready(() => {
  $('#load').click(loadTrips);
  $('#trip-list').on('click', 'a', loadDetails);
  $('#trip-form-location').on('submit', '#trip-form', reserveTrip);
});
