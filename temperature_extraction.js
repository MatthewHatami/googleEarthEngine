// Import ERA5-Land Hourly Aggregated dataset
var dataset = ee.ImageCollection('ECMWF/ERA5_LAND/HOURLY')
               .select('temperature_2m');

// Define a function to process each year
function processYear(year) {
  // Filter the data for the year
  var startDate = ee.Date.fromYMD(year, 1, 1);
  var endDate = startDate.advance(1, 'year');
  var yearData = dataset.filterDate(startDate, endDate);
  
  // Get county boundaries from TIGER/Line dataset
  var counties = ee.FeatureCollection('TIGER/2018/Counties');
  
  // Map over each week to calculate mean temperature
  var weeks = ee.List.sequence(0, 51);
  var weeklyData = weeks.map(function(week) {
    var startWeek = startDate.advance(week, 'week');
    var endWeek = startWeek.advance(1, 'week');
    
    var weekData = yearData.filterDate(startWeek, endWeek)
                           .mean()
                           .reduceRegions({
                             collection: counties,
                             reducer: ee.Reducer.mean(),
                             scale: 10000 // Adjust scale as needed
                           })
                           .map(function(feature) {
                             return feature.set({
                               'week': ee.Number(week).add(1),  // Corrected line
                               'start_date': startWeek.format('YYYY-MM-dd'),
                               'end_date': endWeek.format('YYYY-MM-dd'),
                               'state_name': feature.get('STATEFP'),
                               'state_id': feature.get('STATEFP'),
                               'county_name': feature.get('NAME'),
                               'county_id': feature.get('GEOID'),
                               'mean_temperature': feature.get('mean')
                             });
                           });
    
    return weekData;
  });
  
  weeklyData = ee.FeatureCollection(weeklyData).flatten();
  
  // Export the data to Google Drive
  Export.table.toDrive({
    collection: weeklyData,
    description: 'US_County_Weekly_Temperature_' + year,
    fileFormat: 'CSV',
    selectors: ['county_name', 'county_id', 'state_name', 'state_id', 
                'week', 'start_date', 'end_date', 'mean_temperature']
  });
}

// Loop over the years and process each year
var years = ee.List.sequence(2013, 2023);
years.evaluate(function(yearList) {
  yearList.forEach(function(year) {
    processYear(year);
  });
});