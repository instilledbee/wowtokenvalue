var tokenData, shopData, countriesData;

$(document).ready(function() {
    $.when(wowTokenAjax(), shopAjax(), countriesAjax()).done(function(tokenXHR, shopXHR, countriesXHR) {
        var currRegion, tokenPrice;
        
        tokenData = tokenXHR[0];
        shopData = shopXHR[0];
        countriesData = countriesXHR[0];
        
        console.log(countriesData);
        
        currRegion = $('#region').val();
        tokenPrice = getTokenPrice(currRegion, true);
        
        updateTokenPriceDisplay(currRegion);
        computeTokensNeeded(tokenPrice, shopData);
        
        $('#loading').fadeOut(500, function() {
            insertTables(shopData);
        });
    });
    
    $('#region').change(function() {
        currRegion = $('#region').val();
        tokenPrice = getTokenPrice(currRegion, true);
        
        updateTokenPriceDisplay(currRegion);
        computeTokensNeeded(tokenPrice, shopData);
        
        // Refresh all DTs initialized on the page
        $.fn.dataTable.tables({ 'visible': true, 'api': true }).rows().invalidate();
    });
});

function wowTokenAjax() {
    return $.ajax({
        dataType: 'json',
        url: 'https://wowtoken.info/snapshot.json',
        success: function(d) {
        },
        error: function(jqXHR, status, error) {
            console.log('AJAX Error: ');
            console.log(status);
            console.log(error);
        }
    });
}

function shopAjax() {
    return $.ajax({
        dataType: 'json',
        url: 'items.json',
        success: function(data) {
        },
        error: function(jqXHR, status, error) {
            console.log('AJAX Error: ');
            console.log(status);
            console.log(error);
        }
    });
}

function countriesAjax() {
    return $.ajax({
        dataType: 'json',
        url: 'countries.json',
        success: function(data) {
        },
        error: function(jqXHR, status, error) {
            console.log('AJAX Error: ');
            console.log(status);
            console.log(error);
        }
    });
}

function getTokenPrice(currRegion, isRaw) {
    if (isRaw) {
        return tokenData[currRegion].raw.buy;
    } else {
        return tokenData[currRegion].formatted.buy;
    }
}

function updateTokenPriceDisplay(currRegion) {
    var tokenPrice = getTokenPrice(currRegion, false);
    
    $('#currentValue').text(tokenPrice);
    
    return tokenPrice;
}

function computeTokensNeeded(tokenPrice, shopData) {
    // Loop through shop tables
    for(var prop in shopData) {
        if(!shopData.hasOwnProperty(prop)) {
            continue;
        }
        
        var items = shopData[prop].table;
        
        // Loop through shop items
        for(var j = 0; j < items.length; ++j) {
            var item = items[j];
            item[3] = Math.ceil(item[1] / 15.00);
            item[2] = item[3] * tokenPrice;
        }
    }
}

function insertTables(shopData) {
    // Loop through shop tables
    for(var prop in shopData) {
        if(!shopData.hasOwnProperty(prop)) {
            continue;
        }
        
        var items = shopData[prop].table;
        
        $('#tables').append(
            $('<div/>').addClass('row').append(
                $('<div/>').addClass('col-md-12').append(
                    $('<h2/>').text(shopData[prop].title)
                ).append(
                    $('<table/>').attr('id', prop).addClass('table table-striped table-bordered table-hover').append(
                        $('<thead/>').append(
                            $('<tr/>').append(
                                $('<th/>').text('Item')
                            ).append(
                                $('<th/>').text('Cost ($)')
                            ).append(
                                $('<th/>').text('Gold Needed')
                            ).append(
                                $('<th/>').text('Tokens Needed')
                            )
                        )
                    ).append(
                        $('<tbody/>')
                    )
                )
            )
        );
        
        initDataTable(prop, items);
    }
}

function initDataTable(tableId, tableData) {
    $('#' + tableId).DataTable(dataTableProps(tableData));
}

function dataTableProps(dataContext) {
    return {
        'columns': [
            { 'title': 'Item', 'name': 'item' },
            { 'title': 'Cost ($)', 'name': 'cost', 'render': function(data) { return data.toFixed(2); } },
            { 'title': 'Gold', 'name': 'gold', 'defaultContent': 0, 'render': function(data) { return data.format(); } },
            { 'title': 'Tokens Needed', 'name': 'tokens', 'defaultContent': 0 }
        ],
        'data': dataContext,
        'info': false,
        'paging': false,
        //'responsive': true,
        'searching': false
    };
}