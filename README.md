# Data Visualization Final Project  

#### John McGonagle  

![Flight Delays Box And Whisker Plot](/images/screenshot.jpg)

## Summary
This data visualization shows how various flight delay categories vary over time, grouped in increments of months, days, and hours.  The box and whisker plots show the 10th, 25th, 50th, 75th, and 90th quartiles of flight delays in minutes for a given bin of time and delay category.  Individual box and whisker percentile details can investigated by hovering the mouse over the box and whisker in question.  Switching the time bin (between months, days, and hours) currently displayed can be done using the buttons at the top.

## Design
I originally decided on using a scatter plot to represent the five types of delay causes tracked in the RITA data.  The length of the delay would be encoded in the y position of a particular plot point, while the time bin would be encoded in the x position (i.e. both are continuous scales).  Since there were millions of data points per time bin (i.e. a particular month, day of the week, or hour) in the original dataset, rendering a particular graph using dimple.js took a very long time.  Even when rendered, there was too much overlap for gradients to be visible even at the lowest possible opacity setting.  My next step involved subsampling the data to a manageable size (I picked 5000) so that a reasonable opacity could be used without obscuring the distribution per time bin.  This was all done in preprocessing using pythong and jupyter so that I wouldn't have to process the large, original dataset every time I wanted to refresh the webpage.

This worked, but I found that, due to very large outliers, the vast majority of samples were concentrated near the x-axis.  I tried solving this by using a log scale and a sqrt scale for the y-axis, but even then, the distribution of delays per time bin were too tight to be visually salient.

I then decided to make box and whisker plots to better represent the distribution per time bin.  Since dimple.js doesn't provide a box and whisker plot, I first decided to create a scatter plot in d3.js, which I would then convert using d3.nest and other aggregation functions into a box and whisker plot afterwards.  This eventual d3.js scatter plot looked nearly identical to the original dimple.js plot when it was completed.

After conversion, using d3.nest's functionality, I split the dataset into groups by time bin (the scatter plot only implicitly grouped data points by their x position).  I then calculated the typical box and whisker percentile information for each time bin and flight category, i.e. the 0th, 1st, 2nd, 3rd, and 4th quartiles.  However, as mentioned earlier, the presence of outliers scaled the y-axis to the point of obscuring the distribution data.  I thus decided to only represent the 10th percentile and 90th percentile for the ends of each box and whisker, instead of the usual minimum and maximum.  This greatly recuced the display range of the y-axis, allowing the chart to convey information more readily.

I then added various labels to the axes, as well as titles, to improve clarity.  I also abbreviated axis tick labels and margins to make the charts more aesthetically pleasing and easier to read.  I chose a pastel blue for the boxes because it is easy to view for long periods of time (being muted in brightness).  Blue also has fewer issues for the colorblind, though this is of limited value since there are no other colors in the visualization to confuse.

Once this was done, I decided that, while the box and whisker plots were useful for conveying the overall trend in delays across months, days of the week, and hours of the day, the visualization lacked the fine detail that a user might be interested in.  Thus, I decided to include a tooltip that appeared on hovering over the boxes.  This would allow the user to investigate in detail any interesting data points, without adding too much data (and clutter) to the default visualization.  Since each box and whisker was associated with its own percentile data (using d3's data binding mechanism) and event listener, it was easy to access and display this data on hover events.

With this complete, I added functionlity to the buttons at the top, which were useless up til that point.  I was visually inspecting the different time groupings (months, days, and hours) by changing a hard coded value in the javascript file.  Getting the buttons to update the plots using this value took a lot of refactoring of code, and would have been easier had it been done before all the display methods had been completed.  In particular, I had to include namespaces for the button event listeners, as each chart renders asynchronously, and d3 only allows one button event listener declaration inside callback functions for a particular element.

At this point, I gathered feedback on my design, which is discussed in the next section.  I implemented the recommendations noted by my friends/roommates.

## Feedback
Matt: Matt said the graphs look good with no recommendations on the charts themselves.  He did suggest an overall title to tie the individual charts together.

Kevin: Kevin suggested changing the color of the buttons to contrast with the blue in the charts (I had previously used the same color for both).  I changed this, using a pale orange to oppose the blue.

Dan: Dan commented that the y-label axes were redundant, and only needed to include the units of measurement, since the titles of each individual chart described what those units specifically represented.  I agreed, and changed this, which allowed me to remove some text from the graph that served little purpose.

## Resources
https://github.com/d3/d3/blob/master/API.md
https://www.dashingd3js.com/svg-basic-shapes-and-d3js
https://designshack.net/articles/css/whats-the-deal-with-display-inline-block/
https://javascript.info/closure
https://www.rita.dot.gov/bts/help/aviation/html/understanding.html#q4
http://stat-computing.org/dataexpo/2009/the-data.html