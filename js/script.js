var tokenData, shopData, countriesData;

$(document).ready(function() {
    $.when(wowTokenAjax(), shopAjax(), countriesAjax()).done(function(tokenXHR, shopXHR, countriesXHR) {
        var currRegion, tokenPrice;
        
        tokenData = tokenXHR[0];
        shopData = shopXHR[0];
        countriesData = countriesXHR[0];
        
        console.log(countriesData);
        
        currRegion = $("#region").val();
        tokenPrice = getTokenPrice(currRegion, true);
        
        updateTokenPriceDisplay(currRegion);
        computeTokensNeeded(tokenPrice, shopData);
        initDataTables(tokenData, shopData);
    });
    
    $("#region").change(function() {
        updateTokenPrice(tokenData);
    });
});

function wowTokenAjax() {
    return $.ajax({
        dataType: 'json',
        url: 'https://wowtoken.info/snapshot.json',
        success: function(d) {
        },
        error: function(jqXHR, status, error) {
            console.log("AJAX Error: ");
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
            console.log("AJAX Error: ");
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
            console.log("AJAX Error: ");
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
    
    $("#currentValue").text(tokenPrice);
    
    return tokenPrice;
}

function computeTokensNeeded(tokenPrice, shopData) {
    // Loop through shop tables
    for(var prop in shopData) {
        if(!shopData.hasOwnProperty(prop)) {
            continue;
        }
        
        var items = shopData[prop];
        
        // Loop through shop items
        for(var j = 0; j < items.length; ++j) {
            var item = items[j];
            item[3] = Math.ceil(item[1] / 15.00);
            item[2] = item[3] * tokenPrice;
        }
    }
}

function initDataTables(tokenData, shopData) {
    $('#charServices').DataTable({
        'columns': [
            { 'title': "Item", 'name': "item" },
            { 'title': "Cost ($)", 'name': "cost", 'render': function(data) { return data.toFixed(2); } },
            { 'title': "Gold", 'name': "gold", 'defaultContent': 0, 'render': function(data) { return data.format(); } },
            { 'title': "Tokens Needed", 'name': "tokens", 'defaultContent': 0 }
        ],
        'data': shopData.charServices,
        'info': false,
        'paging': false,
        'searching': false
    });
}