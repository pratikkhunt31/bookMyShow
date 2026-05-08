$(document).ready(function () {
  $(".img-container").slick({
    slidesToShow: 5,
    slidesToScroll: 5,
    speed: 1000,
    infinite: false,
    prevArrow:
      '<button class="slick-prev"><i class="fa fa-angle-left"></i></button>',
    nextArrow:
      '<button class="slick-next"><i class="fa fa-angle-right"></i></button>',

    responsive: [
      {
        breakpoint: 769,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 435,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          autoplay: true,
        },
      },
      {
        breakpoint: 375,
        settings: "unslick",
      },
    ],
  });

  //my Theater

  $("#rows, #cols").on("keydown", function (e) {
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Tab"
    ) {
      return;
    }
    if (e.key < "0" || e.key > "9") {
      e.preventDefault();
    }
  });

  let x = getCookie("row");
  let y = getCookie("col");

  let getsoldSeat = getBookingCookie("booking");

  $("#submit").click(function () {
    let row = $("#rows").val();
    let col = $("#cols").val();

    if (!row || !col) return;

    setCookie(row, col, 30);

    createTheater(row, col);
  });

  if (x && y) {
    createTheater(x, y);
  }

  function createTheater(row, col) {
    let op = "";

    for (let i = 1; i <= row; i++) {
      i == 1 ? (op += "<h4>₹290 IMPERIAL SOFA</h4>") : "";
      i == 2 ? (op += "<h4>₹200 PLATINUM</h4>") : "";
      i == 7 ? (op += "<h4>₹170 GOLD PLUS</h4>") : "";
      i == 12 ? (op += "<h4>₹150 GOLD</h4>") : "";
      i == 16 ? (op += "<h4>₹105 SILVER</h4>") : "";

      let price =
        i == 1 ? 290 : i < 7 ? 200 : i < 12 ? 170 : i < 16 ? 150 : 105;

      let seat = String.fromCharCode(64 + i);
      op += `<span style='min-width:20px'>${seat}</span>`;
      for (let j = 1; j <= col; j++) {
        let num = j < 10 ? j.toString().padStart(2, "0") : j;
        let space =
          i >= 7 && i <= 11 && j == 6
            ? "<span><span><span><span></span></span></span></span>"
            : "";

        // if ((i == 6 || i == 5) && (j == col || j == col - 1)) {
        //   continue;
        // }
        const isBooked = getsoldSeat.some((b) =>
          b.seats.includes(`${seat + "-" + num}`),
        );

        const cls = isBooked ? "booked" : "";

        op += `<button id='seat' class = '${cls}' seatId='${seat + "-" + num}' price='${price}'>${num}</button>${space}`;
      }
      op += "<br>";
    }

    let selectedSeats = [];
    let totalPrice = 0;

    $(".result").html(op);

    $(".result").on("click", "#seat", function () {
      addSeat($(this).attr("seatId"), $(this).attr("price"));
      $(this).toggleClass("active");
      if (totalPrice > 0) {
        $(".bottom").show();
        $(".bottom").css("display", "flex");
      } else {
        $(".bottom").hide();
      }
      $("#payment").text(`Pay ₹${totalPrice}`);
    });

    function addSeat(seatId, price) {
      if (selectedSeats.includes(seatId)) {
        selectedSeats = selectedSeats.filter((seat) => seat !== seatId);
        totalPrice -= Number.parseInt(price);
      } else {
        selectedSeats.push(seatId);
        totalPrice += Number.parseInt(price);
      }
    }

    $("#book").click(function () {
      swal
        .fire({
          title: "Booking Details",
          html: `
    <input id="swal-input1" class="swal2-input" placeholder='Username' autocomplete='off' required>
    <input id="swal-input2" class="swal2-input" readonly>,
    <input id="swal-input3" class="swal2-input" readonly>`,

          confirmButtonText: `Confirm`,
          confirmButtonColor: `#eb4e62`,
          focusConfirm: false,
          showConfirmButton: true,
          showCancelButton: true,

          didOpen: () => {
            $("#swal-input2").val(selectedSeats);
            document.getElementById("swal-input3").value = totalPrice;
          },

          preConfirm: () => {
            let userName = $("#swal-input1").val();

            if (!userName) {
              Swal.showValidationMessage("Username is Required");
              return false;
            }
            return {
              user: userName,
              seats: selectedSeats,
              amount: totalPrice,
            };
          },
        })
        .then((result) => {
          console.log(result);
          let bookingData = getBookingCookie("booking");

          let newBooking = {
            username: result.value.user,
            seats: result.value.seats,
            amount: result.value.amount,
          };
          // debugger;

          bookingData.push(newBooking);
          bookSeat(JSON.stringify(bookingData), 30);
          // debugger;

          selectedSeats.forEach((id) => {
            // debugger;
            $(`[seatId = "${id}"]`).toggleClass("active").addClass("booked");
          });

          selectedSeats = [];
          totalPrice = 0;

          Swal.fire({
            icon: "success",
            title: "Booked!",
            text: "Seats booked successfully!",
          });
          $(".bottom").hide();
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  let seatHtml = "";

  // + ticket
  getsoldSeat.forEach((b, index) => {
    // console.log(getsoldSeat[index]);
    seatHtml += `<section class="ticket-card">
        <button class="delete-btn" data-index='${index}'>
          <i class="fa-solid fa-trash"></i>
        </button>
        <h1 class="ticket-title">Movie Ticket</h1>
        <ul class="info-list">
          <li class="info-item">
            <span>Username</span>
            <strong>${b.username}</strong>
          </li>
          <li class="info-item">
            <span>Seat</span>
            <strong>${b.seats}</strong>
          </li>
          <li class="info-item">
            <span>Payment</span>
            <strong>₹ ${b.amount}</strong>
          </li>
        </ul>
      </section>`;
  });

  $(".ticket-page").html(seatHtml);

  $(".delete-btn").click(function () {
    let i = $(this).data("index");

    getsoldSeat = getsoldSeat.filter((s) => s.seats !== getsoldSeat[i].seats);

    bookSeat(JSON.stringify(getsoldSeat), 30);

    location.reload();
  });

  function setCookie(row, col, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie = "row=" + row + ";" + expires + ";path=/";
    document.cookie = "col=" + col + ";" + expires + ";path=/";
  }

  function bookSeat(seat, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie = "booking=" + seat + ";" + expires;
  }

  function getCookie(cname) {
    let name = cname + "=";
    let decodeCookie = decodeURIComponent(document.cookie);
    let ca = decodeCookie.split(";");

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  function getBookingCookie(bookings) {
    const bookingCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith(bookings + "="));

    if (!bookingCookie) return [];

    return JSON.parse(bookingCookie.split("=")[1]);
  }
});
