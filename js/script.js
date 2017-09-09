function draw_flight_delays() {
    "use strict";
    
    // chart margins and dimensions
    var margin = {'left': 60, 'right': 60, 'top': 60, 'bottom': 60},
        width = 400,
        height = 300;
    
    // where the preprocessed csv files are kept
    var rel_path = '../data/';
    // used for referencing individual charts
    var delay_types = ['carrier', 'late_aircraft', 'nas', 'security', 'weather'];
    // names of various columns in csv files to be charted
    var delay_column_names = ['CarrierDelay', 'LateAircraftDelay', 'NASDelay', 'SecurityDelay', 'WeatherDelay'];
    
    // name of columns in csv files corresponding to time mode
    var modes = ['Month', 'DayOfWeek', 'Time'];
    
    // used for placing x-axis ticks dependent on mode
    var x_tick_values = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                         [1, 2, 3, 4, 5, 6, 7],
                         [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]];
    // used for labeling x-axis ticks dependent on mode
    var x_tick_labels = [['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                         ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                         ['0', '2', '4', '6', '8', '10', '12', 
                          '14', '16', '18', '20', '22', '24']];
    
    // labels for the x and y axes dependent on mode
    var x_label = ['Month', 'Day Of The Week', 'Hour Of The Day'];                
    var y_label = ['Carrier Delays', 'Late Aircraft Delays', 'NAS Delays', 'Security Delays', 'Weather Delays'];

    // percentiles used for box and whisker plots and tooltip
    var bwq = [.1, .25, .5, .75, .9];
    
    // calculates the percentiles of interest for a particular delay and mode
    function box_whisker_stats(d) {
        return [d3.quantile(d, bwq[0]),
                d3.quantile(d, bwq[1]),
                d3.quantile(d, bwq[2]),
                d3.quantile(d, bwq[3]),
                d3.quantile(d, bwq[4])];
    };
    
    // creates the tooltip element
    var tip = d3.select('body')
                .append('div')
                .attr('class', 'tooltip')
    
    // creates a dynamic array of mode button elements
    var buttons = d3.select('body')
                    .append('div')
                    .attr('class', 'mode_buttons')
                    .selectAll('.button')
                    .data([0, 1, 2])
                    .enter()
                    .append('div')
                    .attr('class', 'button')
                    .text(function(mode_index) {
                        return x_label[mode_index];
                    });
    
    // indicate the initial mode button is the first button by coloring it blue
    d3.select('.button')
        .style('background', 'rgb(140, 240, 240)');
    
    // plots the extracted data given a time mode
    function plot(data, dt, dcn, yl) {
        
        // convert string data to numeric
        data.forEach(function(d) {
            d['Month'] = +d['Month'];
            d['DayOfWeek'] = +d['DayOfWeek'];
            d['Time'] = +d['Time'];
            d[dcn] = +d[dcn];
        });
        
        // selects this chart for the delay of interest
        var chart = d3.select('.' + dt + '_chart');
            
        
        // updates the data upon changing the mode by clicking one of the mode buttons
        function update(mode_index) {
            
            // extracts relevant information for the new time mode
            var xtv = x_tick_values[mode_index], 
                xtl = x_tick_labels[mode_index], 
                xl = x_label[mode_index];
            
            var getX = function(d) {
                return d[modes[mode_index]];
            };
            var getY = function(d) {
                return d[dcn];
            };
            
            // groups data by time mode value and calculates the box and whisker plot statistics
            var bw_stats_all = d3.nest()
                                .key(getX)
                                .rollup(function(values) {
                                    var delays = values.map(getY);
                                    return box_whisker_stats(delays.sort(function(a, b) {
                                        return a - b;
                                    }));
                                })
                                .entries(data);
            
            // converts the key to a numeric value for plotting
            bw_stats_all.forEach(function(d) {
                d['key'] = +d['key'];
            });
            
            // removes all previously inserted chart elements
            chart.selectAll('*').remove();
            
            // define the conversion scales from values to pixels given the new mode and delay of interest
            var x_scale = d3.scale.linear()
                                .domain([d3.min(data, getX) - 1, d3.max(data, getX) + 1])
                                .range([margin['left'], width + margin['left']]);
            var y_scale = d3.scale.linear()
                                .domain([d3.min(bw_stats_all, function(d) {
                                    return d['values'][0];
                                }),
                                        d3.max(bw_stats_all, function(d) {
                                    return d['values'][4];
                                })])
                                .range([height + margin['top'], margin['top']]); 
            
            // create the axes
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
            
            // creates a string representation of the tooltip html
            var tip_html = function(d) {
                var h = new Array(6);
                
                h[0] = '<strong>Percentiles</strong>';
                
                for (var i = 0; i < 5; i++) {
                    h[i + 1] = '<strong>' + (100 * bwq[i]) + '%:</strong> <span>' + Math.round(d['values'][i]) + '</span>';
                }
                
                return h.join('<br\>');;
            };
            
            // calculates box width that optimizes balance of filling and white space
            var box_width = Math.floor((width * .75) / (d3.max(data, getX) - d3.min(data, getX) + 2));
            
            // inserts the whiskers for each box and whisker element
            chart.selectAll('.bw_v_line')
                .data(bw_stats_all)
                .enter()
                .append('line')
                .attr('class', 'bw_v_line bw_line')
                .attr('x1', function(d) {return x_scale(d['key']);})
                .attr('y1', function(d) {return y_scale(d['values'][0]);})
                .attr('x2', function(d) {return x_scale(d['key']);})
                .attr('y2', function(d) {return y_scale(d['values'][4]);})
            
            // inserts the boxes for each box and whisker element
            chart.selectAll('.bw_box')
                .data(bw_stats_all)
                .enter()
                .append('rect')
                .attr('class', 'bw_box bw_line')
                .attr('x', function(d) {return x_scale(d['key']) - (box_width / 2);})
                .attr('y', function(d) {return y_scale(d['values'][3]);})
                .attr('width', box_width)
                .attr('height', function(d) {return y_scale(d['values'][1]) - y_scale(d['values'][3]);})
                .on('mouseover', function(d) {
                    tip.transition()
                       .duration(200)    
                       .style('opacity', 1)
                    tip.html(tip_html(d));    
                })
                // displays a tooltip upon entering the box
                .on('mousemove', function(d) {
                    tip.style('left', (d3.event.pageX + 10) + 'px')
                       .style('top', (d3.event.pageY - 20) + 'px')
                })
                // removes the tooltip upon exiting the box
                .on('mouseout', function(d) {           
                    tip.transition()            
                        .duration(400)          
                        .style('opacity', 0);   
                });
            
            // inserts the cap of the bottom whisker
            chart.selectAll('.bw_hb_line')
                .data(bw_stats_all)
                .enter()
                .append('line')
                .attr('class', 'bw_hb_line bw_line')
                .attr('x1', function(d) {return x_scale(d['key']) - (box_width / 2);})
                .attr('y1', function(d) {return y_scale(d['values'][0]);})
                .attr('x2', function(d) {return x_scale(d['key']) + (box_width / 2);})
                .attr('y2', function(d) {return y_scale(d['values'][0]);});
            
            // inserts the cap of the top whisker
            chart.selectAll('.bw_ht_line')
                .data(bw_stats_all)
                .enter()
                .append('line')
                .attr('class', 'bw_ht_line bw_line')
                .attr('x1', function(d) {return x_scale(d['key']) - (box_width / 2);})
                .attr('y1', function(d) {return y_scale(d['values'][4]);})
                .attr('x2', function(d) {return x_scale(d['key']) + (box_width / 2);})
                .attr('y2', function(d) {return y_scale(d['values'][4]);});
            
            // inserts the median line of the box
            chart.selectAll('.bw_hm_line')
                .data(bw_stats_all)
                .enter()
                .append('line')
                .attr('class', 'bw_hm_line bw_line')
                .attr('x1', function(d) {return x_scale(d['key']) - (box_width / 2);})
                .attr('y1', function(d) {return y_scale(d['values'][2]);})
                .attr('x2', function(d) {return x_scale(d['key']) + (box_width / 2);})
                .attr('y2', function(d) {return y_scale(d['values'][2]);});
            
            // inserts the x-axis
            chart.append('g')
                .attr('class', 'x_axis')
                .attr('transform', 'translate(0, ' + (height + margin['top']) + ')')
                .call(x_axis);

            // inserts the y-axis
            chart.append('g')
                .attr('class', 'y_axis')
                .attr('transform', 'translate(' + margin['left'] + ', 0)')
                .call(y_axis);
            
            // inserts the title
            chart.append('text')
                .attr('class', 'title')
                .attr('x', (width + margin['left'] + margin['right']) / 2)             
                .attr('y', margin['top'] / 2)
                .attr('text-anchor', 'middle')
                .text(yl + ' By ' + xl);
            
            // inserts the x-axis label
            chart.append('text')
                .attr('class', 'axis_label')
                .attr('x', margin['left'] + (width / 2))           
                .attr('y', margin['top'] + height + (margin['bottom'] * .75))
                .attr('text-anchor', 'middle')
                .text(xl);
            
            // inserts the y-axis label
            chart.append('text')
                .attr('class', 'axis_label')
                .attr('transform', 'rotate(-90)')
                .attr('y', margin['left'] * .25)             
                .attr('x', -(margin['top'] + (height / 2)))
                .attr('text-anchor', 'middle')
                .text(yl + ' (Minutes)');
        }
        
        // creates the intial plot of the delay charts
        update(0);
        
        // create button listener (with namespace for multiple concurrent listeners) for this chart to know
        // when to change display modes
        buttons.on('click' + '.' + dt, function(mode_index) {
               d3.select('.mode_buttons')
                 .selectAll('.button')
                 .transition()
                 .duration(200)
                 .style('background', 'rgb(240, 240, 240)');
               d3.select(this)
                 .transition()
                 .duration(200)
                 .style('background', 'rgb(140, 240, 240)');
               update(mode_index);
        });
    };
    
    // for each type of delay, plot a chart using the current time mode.  Updates to the time mode will be
    // handled by even listeners created inside the plot callback function.
    for (var delay_index = 0; delay_index < delay_types.length; delay_index++) {
        // use a closure to fix value of delay_index for each delay type (since plot is a callback fuction
        // and is thus asynchronous
        (function(i) {
            d3.select('body')
            .append('svg')
            .attr('width', width + margin['left'] + margin['right'])
            .attr('height', height + margin['top'] + margin['bottom'])
            .attr('class', delay_types[i] + '_chart');
            
            d3.csv(rel_path + delay_types[i] + '_delays.csv', function(data) {
                plot(data, delay_types[i], delay_column_names[i], y_label[i]);
            });
        }(delay_index));
    }
}