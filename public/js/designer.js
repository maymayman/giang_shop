const help = {
  getCategories: async function(keyword, menuId, parentId) {
    try {
      const url = `/menu/categories?keyword=${keyword}&menu=${menuId}&parent=${parentId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
        }        
      });

      const result = await response.text();

      return result;
    } catch(error) {
      console.error(error);
      throw error;
    }
  },

  getParentCategoriesByMenu: async function(menuId) {
    try {
      const url = `/menu/categories/parent?menu=${menuId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }        
      });

      const result = await response.json();

      return result;
    } catch(error) {
      console.error(error);
      throw error;
    }
  }
};

(function($) {
  "use strict";

  const keyword = $('.keyword-search').val();
  const menuId = $('.menu').children("option:selected").val();
  const parentId = $('.parent').children("option:selected").val();

  help.getCategories(keyword, menuId, parentId).then(data => {
    $('.designers-result').html(data);
  }).catch(error => {
    console.error(error);
  });

  $('.menu').on('change', async function() {
    const $this = this;
    const menuId = $this.value;

    const parentCategories = await help.getParentCategoriesByMenu(menuId);

    $('.parent').empty();
    parentCategories.forEach(element => {
      $('.parent').append($("<option></option>").attr("value", element.objectId).text(element.name));
    });

    const search_keyword = $('.keyword-search').val();
    const search_menuId = $('.menu').children("option:selected").val();
    const search_parentId = $('.parent').children("option:selected").val();

    const data = await help.getCategories(search_keyword, search_menuId, search_parentId);

    $('.designers-result').html(data);
  });

  $('.parent').on('change', async function() {
    const search_keyword = $('.keyword-search').val();
    const search_menuId = $('.menu').children("option:selected").val();
    const search_parentId = $('.parent').children("option:selected").val();

    const data = await help.getCategories(search_keyword, search_menuId, search_parentId);

    $('.designers-result').html(data);
  });

  $('.designers-search').on('input', async function() {
    const search_keyword = $('.keyword-search').val();
    const search_menuId = $('.menu').children("option:selected").val();
    const search_parentId = $('.parent').children("option:selected").val();

    const data = await help.getCategories(search_keyword, search_menuId, search_parentId);

    $('.designers-result').html(data);
  });
  
})(jQuery);