import pandas

# import raw data
df = pandas.read_csv('../data/2008_Flight_Data.csv')

# select columns for use in analysis
flight_data = df[['Month', 'DayOfWeek', 'CRSDepTime',
                  'CarrierDelay', 'WeatherDelay', 'NASDelay', 
                  'SecurityDelay', 'LateAircraftDelay']]
# remove all rows with NaNs
flight_data.dropna(axis=0, how='any', inplace=True)

# convert military time to time on discretized continuous 0-24 scale
flight_data['Time'] = flight_data['CRSDepTime'] // 100

months = ['January', 'February', 'March', 'April', 'May', 'June', 
          'July', 'August', 'September', 'October', 'November', 
          'December']
days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 
        'Friday', 'Saturday', 'Sunday']

# convert numeric encodings of month and day to string encodings
#flight_data['Month'].replace(range(1, 13), months, inplace=True)
#flight_data['DayOfWeek'].replace(range(1, 8), days, inplace=True)

# drop unused columns
flight_data.drop(['CRSDepTime'], axis=1, inplace=True)

# separate each delay category into its own dataframe for faster analysis
carrier_delays = flight_data[flight_data['CarrierDelay'] != 0.0]
                 [['Month', 'DayOfWeek', 'Time', 'CarrierDelay']]
weather_delays = flight_data[flight_data['WeatherDelay'] != 0.0]
                 [['Month', 'DayOfWeek', 'Time', 'WeatherDelay']]
nas_delays = flight_data[flight_data['NASDelay'] != 0.0]
             [['Month', 'DayOfWeek', 'Time', 'NASDelay']]
security_delays = flight_data[flight_data['SecurityDelay'] != 0.0]
                  [['Month', 'DayOfWeek', 'Time', 'SecurityDelay']]
late_aircraft_delays = flight_data[flight_data['LateAircraftDelay'] != 0.0]
                       [['Month', 'DayOfWeek', 'Time', 'LateAircraftDelay']]

carrier_delays = carrier_delays.sample(5000)
weather_delays = weather_delays.sample(5000)
nas_delays = nas_delays.sample(5000)
security_delays = security_delays.sample(5000)
late_aircraft_delays = late_aircraft_delays.sample(5000)

# set relative path for data directory
rel_data_path = '../data/'

# save each delay category's dataframe into a separate csv
carrier_delays.to_csv(rel_data_path + 'carrier_delays.csv')
weather_delays.to_csv(rel_data_path + 'weather_delays.csv')
nas_delays.to_csv(rel_data_path + 'nas_delays.csv')
security_delays.to_csv(rel_data_path + 'security_delays.csv')
late_aircraft_delays.to_csv(rel_data_path + 'late_aircraft_delays.csv')
