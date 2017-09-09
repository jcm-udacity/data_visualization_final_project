function draw_flight_delays() {
    "use strict";
    
    var margin = {'left': 60, 'right': 60, 'top': 60, 'bottom': 60},
        width = 400,
        height = 300;
    
    var rel_path = '../data/';
    var delay_types = ['carrier', 'late_aircraft', 'nas', 'security', 'weather'];
    var delay_column_names = ['CarrierDelay', 'LateAircraftDelay', 'NASDelay', 'SecurityDelay', 'WeatherDelay'];
    
    var modes = ['Month', 'DayOfWeek', 'Time'];
    
    var x_tick_values = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                         [1, 2, 3, 4, 5, 6, 7],
                         [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]];
    var x_tick_labels = [['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                         ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                         ['0', '2', '4', '6', '8', '10', '12', 
                          '14', '16', '18', '20', '22', '24']];
    
    var x_label = ['Month', 'Day Of The Week', 'Hour Of The Day'];                
    var y_label = ['Carrier Delays', 'Late Aircraft Delays', 'NAS Delays', 'Security Delays', 'Weather Delays'];
                    
    var mode_index = 1;
    
    var plot = function(data, dt, dcn, xtv, xtl, xl, yl) {
        
        data.forEach(function(d) {
            d['Month'] = +d['Month'];
            d['DayOfWeek'] = +d['DayOfWeek'];
            d['Time'] = +d['Time'];
            d[dcn] = +d[dcn];
        });
        
        var chart = d3.select('.' + dt + '_chart');
        
        var getX = function(d) {
            return d[modes[mode_index]];
        };
        var getY = function(d) {
            return d[dcn];
        };
        
        var x_scale = d3.scale.linear()
                              .domain([d3.min(data, getX) - 1, d3.max(data, getX) + 1])
                              .range([margin['left'], width + margin['left']]);
        var y_scale = d3.scale.linear()
                              .domain([d3.min(data, getY) - 1, d3.max(data, getY) + 1])
                              .range([height + margin['top'], margin['top']]); 
        
        var x_axis_class = dt + '_x_axis';                     
        var y_axis_class = dt + '_y_axis';
        var title_class = dt + '_title';
        var circle_class = dt + '_circle';
        
        var x_axis = d3.svg.axis()
                           .scale(x_scale)
                           .orient('bottom')
                           .tickValues(xtv)
                           .tickFormat(function(d,i) {
                               return xtl[i];
                           });
        var y_axis = d3.svg.axis()
                           .scale(y_scale)
                           .orient('left');
        
        // plot points
        chart.selectAll('.' + circle_class)
            .data(data)
            .enter()
            .append('circle')
            .attr('class', circle_class)
            .attr('cx', function(d) {return x_scale(getX(d));})
            .attr('cy', function(d) {return y_scale(getY(d));})
            .attr('r', 8)
            .style('fill', 'blue')
            .style('opacity', '.01');
            
       // x-axis
        chart.append('g')
            .attr('class', x_axis_class)
            .attr('transform', 'translate(0, ' + (height + margin['top']) + ')')
            .call(x_axis);

        // y-axis
        chart.append('g')
            .attr('class', y_axis_class)
            .attr('transform', 'translate(' + margin['left'] + ', 0)')
            .call(y_axis);
        
        //title
        chart.append('text')
              .attr('class', title_class)
              .attr('x', (width + margin['left'] + margin['right']) / 2)             
              .attr('y', margin['top'] / 2)
              .attr('text-anchor', 'middle')
              .text(yl + ' By ' + xl);
    };
    
    for (var delay_index = 0; delay_index < delay_types.length; delay_index++) {
        (function(i) {
            d3.select('body')
            .append('svg')
            .attr('width', width + margin['left'] + margin['right'])
            .attr('height', height + margin['top'] + margin['bottom'])
            .attr('class', delay_types[i] + '_chart');
            
            d3.csv(rel_path + delay_types[i] + '_delays.csv', function(data) {
                plot(data, delay_types[i], delay_column_names[i], 
                     x_tick_values[mode_index], x_tick_labels[mode_index], 
                     x_label[mode_index], y_label[i]);
            });
        }(delay_index));
    }
}