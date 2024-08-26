var filtered_before = imageCollection
.filter(ee.Filter.date('2018-01-01', '2019-01-01'))
.filter(ee.Filter.bounds(geometry))
.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10));

var filtered_after = imageCollection
.filter(ee.Filter.date('2024-01-01', '2024-08-20'))
.filter(ee.Filter.bounds(geometry))
.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10));

var visParams = {
  min : 0,
  max : 3000,
  bands : ['B8', 'B4', 'B3']
};

Map.addLayer(filtered_before, visParams, '2018 Image')
Map.addLayer(filtered_after, visParams, '2024 Image')
print(filtered_before)