(function ($) {
  $(document).ready(function () {

    let cityCodeDefault = $('#filterCityCode :selected').val()
    if (cityCodeDefault) {
      let totalAmount = Number($('.total-amount').data('total-amount'))
      if (totalAmount > 750000) {
        $('#feeShip').text(0)
      } else {
        if (cityCodeDefault === '79') {
          let total = totalAmount + 25000
          $('#feeShip').text(25000)
          $('.total-amount').text(total)
        } else {
          let totalAmount = Number($('.total-amount').data('total-amount'))
          let total = totalAmount + 35000;
          $('#feeShip').text(35000)

          $('.total-amount').text(total)
        }
      }

      $.ajax({
        url: `/location/district?city=${cityCodeDefault}`,
        // data: formDataToUpload,// the formData function is available in almost all new browsers.
        type:'GET',
        contentType:false,
        processData:false,
        cache:false,
        dataType:'json', // Change this according to your response from the server.
        beforeSend: function() {
          console.log('before');
        },
        error:function(err){
          console.log('err: ', err)
          alert(err);
        },
        success:function(data){
          // $('select[name="filterDistrictCode"]').prop("disabled", false);
          for (let district of data) {
            $('select[name="filterDistrictCode"]').append($('<option>', {value:district.code, text:district.name}));
          }
          let districtCodeDefault = $('#filterDistrictCode :selected').val()
          console.log("districtCodeDefault 11111: ", districtCodeDefault)
          $.ajax({
            url: `/location/ward?city=${cityCodeDefault}&district=${districtCodeDefault}`,
            // data: formDataToUpload,// the formData function is available in almost all new browsers.
            type:'GET',
            contentType:false,
            processData:false,
            cache:false,
            dataType:'json', // Change this according to your response from the server.
            beforeSend: function() {
              console.log('before');
            },
            error:function(err){
              console.log('err: ', err)
              alert(err);
            },
            success:function(data){
              // $('select[name="filterDistrictCode"]').prop("disabled", false);
              console.log('wards: ', data)
              for (let ward of data) {
                $('select[name="filterWardCode"]').append($('<option>', {value:ward.code, text:ward.name}));
              }
              // $('#filterDistrictCode').html(data)
            }
          });

        }
      });
    }

    $('#filterCityCode').on('change', function () {
      let cityCode = $('#filterCityCode :selected').val()
      let totalAmount = Number($('.total-amount').data('total-amount'))

      if ( totalAmount > 750000) {
        $('#feeShip').text(0)

      } else {
        if (cityCode === '79') {
          let totalAmount = Number($('.total-amount').data('total-amount'))
          let total = totalAmount + 25000
          $('#feeShip').text(25000)
          $('.total-amount').text(total)
        } else {
          let totalAmount = Number($('.total-amount').data('total-amount'))
          let total = totalAmount + 35000;
          $('#feeShip').text(35000)

          $('.total-amount').text(total)
        }
      }

      $.ajax({
        url: `/location/district?city=${cityCode}`,
        // data: formDataToUpload,// the formData function is available in almost all new browsers.
        type:'GET',
        contentType:false,
        processData:false,
        cache:false,
        dataType:'json', // Change this according to your response from the server.
        beforeSend: function() {
          console.log('before');
        },
        error:function(err){
          console.log('err: ', err)
          alert(err);
        },
        success:function(data){
          console.log('data: ', data);
          // $('select[name="filterDistrictCode"]').prop("disabled", false);
          $("#filterDistrictCode option").remove();
          for (let district of data) {
            $('select[name="filterDistrictCode"]').append($('<option>', {value:district.code, text:district.name}));
          }
          // $('#filterDistrictCode').html(data)
          let districtCodeChange = $('#filterDistrictCode :selected').val()
          console.log("districtCodeDefault 11111: ", districtCodeChange)
          $.ajax({
            url: `/location/ward?city=${cityCode}&district=${districtCodeChange}`,
            // data: formDataToUpload,// the formData function is available in almost all new browsers.
            type:'GET',
            contentType:false,
            processData:false,
            cache:false,
            dataType:'json', // Change this according to your response from the server.
            beforeSend: function() {
              console.log('before');
            },
            error:function(err){
              console.log('err: ', err)
              alert(err);
            },
            success:function(data){
              // $('select[name="filterDistrictCode"]').prop("disabled", false);
              console.log('wards: ', data)
              $("#filterWardCode option").remove();

              for (let ward of data) {
                $('select[name="filterWardCode"]').append($('<option>', {value:ward.code, text:ward.name}));
              }
              // $('#filterDistrictCode').html(data)
            }
          });
        }
      });
    })

    $('#filterDistrictCode').on('change', function () {
      let cityCodeSelected = $('#filterCityCode :selected').val()
      let districtCodeSelected = $('#filterDistrictCode :selected').val()
      $.ajax({
        url: `/location/ward?city=${cityCodeSelected}&district=${districtCodeSelected}`,
        // data: formDataToUpload,// the formData function is available in almost all new browsers.
        type:'GET',
        contentType:false,
        processData:false,
        cache:false,
        dataType:'json', // Change this according to your response from the server.
        beforeSend: function() {
          console.log('before');
        },
        error:function(err){
          console.log('err: ', err)
          alert(err);
        },
        success:function(data){
          // $('select[name="filterDistrictCode"]').prop("disabled", false);
          console.log('wards: ', data)
          $("#filterWardCode option").remove();
          for (let ward of data) {
            $('select[name="filterWardCode"]').append($('<option>', {value:ward.code, text:ward.name}));
          }
          // $('#filterDistrictCode').html(data)
        }
      });

    })
  });
})(jQuery);