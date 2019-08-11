

(function ($) {
  $(document).ready(function () {
    $('.btn-outline-success.complete').on('click', async function () {
      let orderId = $(this).attr('data-order-id');
      console.log('orderId: ', $(this).attr('data-order-id'));
      const callUrl = `/admin/order/update/${orderId}`
      let data = await fetch(callUrl, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        body: JSON.stringify({status: 'COMPLETED'}),
        headers: {
          // 'Accept': 'application/json',
          "Content-Type": "application/json",
          // "Content-Type": "application/x-www-form-urlencoded",
        }});
      data = await data.json();
      console.log('result: ', data);
      if (data) {
        window.location = `/admin/order?status=COMPLETED`; // redirect
      }
    })
    $('.btn-outline-success.failed').on('click',  function () {
      let orderId = $(this).attr('data-order-id');
      $('#reasonModal').modal('show');
      $('.finish-reason').on('click', async function () {
        let reasons = $('#reason').val();
        if (!reasons){
          return false;
        }
        const callUrl = `/admin/order/update/${orderId}`
        let data = await fetch(callUrl, {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, cors, *same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          credentials: "same-origin", // include, *same-origin, omit
          body: JSON.stringify({status: 'FAILED', reasons: reasons}),
          headers: {
            // 'Accept': 'application/json',
            "Content-Type": "application/json",
            // "Content-Type": "application/x-www-form-urlencoded",
          }});
        data = await data.json();
        console.log('result: ', data);
        if (data) {
          window.location = `/admin/order?status=COMPLETED`; // redirect
        }
      });
    })
  })
})(jQuery);
