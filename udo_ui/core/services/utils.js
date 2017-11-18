/**
 * @ngdoc service
 * @name udoModule.service:utils
 * @description Udo service that holds common date utility functions
 */
udoModule.service('utils', function utils() {
    return {
        html: { 
            /** @ngdoc method
             *  @methodOf udoModule.service:utils
             *  @name udoModule.service:utils#html.escape
             *  @param {string} data The string with html to be escaped.
             *  @return {string} counter Returns the number of subdictionaries in a JSON
             *  @description returns an string escaped with the data escaped
             *      (the html, javascript etc will be shown on the UI).
             */
            escape: function (data) {
                return $('<div></div>').text(data).html();
            },
            scrollToDiv: function(div){
                $("body, html").animate({ 
                    scrollTop: $('#' + div).offset().top - 210
                }, 300);
            }
        },
        json: {
            /** @ngdoc method
             *  @methodOf udoModule.service:utils
             *  @name udoModule.service:utils#json.length
             *  @param {Object:JSON} field the json dictionary to get the length
             *  @return {number} counter The number of subdictionaries in a JSON
             *  @description Returns the number of subdicts in a json object
             */
            length: function (field) {
                var counter = 0;
                angular.forEach(field, function(value, key) {
                    counter++;
                });
                return counter;
            }
        },
        date: {
            /** @doc function.
             *  @methodOf udoModule.service:utils
             *  @name udoModule.service:utils#date.getRepairDate.
             *  @description Returns the date the incidence has been solved.
             *  @param incidence
             *  @return The date the incidence has been solved. Null otherwise
             */
            getRepairDate: function (incidence) {
                var d = null;
                var solved_states = ['Solved', 'Closed'];
                var is_solved = (solved_states.indexOf(incidence.status) > -1); 
                
                if (is_solved && incidence.status_change && incidence.status_change.length) {
                    for (var n=incidence.status_change.length, status; status=incidence.status_change[--n]; ) {
                        if ('Solved' === status.code) {
                            d = status.start;
                            break;
                        }
                    }
                }
                return d;
            },
            /** @doc function.
             *  @methodOf udoModule.service:utils
             *  @name udoModule.service:utils#date.isSolved.
             *  @description Auxiliary function used for switches that check
             *  upon the incidence being solved or not.
             *  @param incidence
             *  @return the name of the variable where the info about the
             *  incidence being solved or not is stored
             */
            isSolved: function(incidence) {
                var solved_states = ['Solved', 'Closed'];
                this.is_solved = (incidence === "no_data") ? "no_data" : (solved_states.indexOf(incidence.status) > -1) ? "yes" : "no";
                return "is_solved";
            },
            /** @doc function.
             *  @methodOf utc2local
             *  @name udoModule.service:utils#date.utc2local.
             *  @description Converts a UTC date string from server into a local time
             *  @param gmtString string from the server. Format must be YYYY-mm-DD HH:MM:SS.ffffff
             *  @return a Date object with added local info
             */
            utc2local: function(gmtString) {
                var local_datetime = undefined;
                if (gmtString) { // Bugfix -> TypeError: Cannot call method 'split' of undefined
                    var utc_datetime = gmtString.split(' ');
                    var utc_date = utc_datetime[0];
                    utc_date = utc_date.split('-');
                    var utc_time = utc_datetime[1] || '00:00:00.000000';
                    utc_time = utc_time.split(':');
                    var utc_datetime = new Date(utc_date[0], parseInt(utc_date[1]) - 1, utc_date[2], utc_time[0], utc_time[1], utc_time[2], 0);
                    
                    local_datetime = utc_datetime;
                    local_datetime.setMinutes(utc_datetime.getMinutes() - utc_datetime.getTimezoneOffset());  
                }

                return local_datetime;
            },
            /** @doc function.
             *  @methodOf local2utc
             *  @name udoModule.service:utils#date.local2utc.
             *  @description Convert a local date object into a UTC string in the form YYYY-mm-DD HH:MM:SS.ffffff
             *  @param dateobject an JavaScript's date object
             *  @return a string with the following UTC format: YYYY-mm-DD HH:MM:SS.ffffff
             */
            local2utc: function(dateObject) {
                function pad(n) { return n<10 ? '0'+n : n; }

                return (dateObject.getUTCFullYear() + '-' +
                        pad(dateObject.getUTCMonth() + 1) + '-' +
                        pad(dateObject.getUTCDate()) + ' ' +
                        pad(dateObject.getUTCHours()) + ':' +
                        pad(dateObject.getUTCMinutes()) + ':' +
                        pad(dateObject.getUTCSeconds()) + '.' +
                        dateObject.getUTCMilliseconds() * 1000);
           },
            /** @doc function.
             *  @methodOf string2date
             *  @name udoModule.service:utils#date.string2date.
             *  @description Convert a UTC string in the form YYYY-mm-DD HH:MM:SS.ffffff to Date object
             *  @param dateString a UTC string in the form YYYY-mm-DD HH:MM:SS.ffffff
             *  @return a date object
             */
            string2date: function(dateString) {
                var regex = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{1,5})/;
                var dateArray = regex.exec(dateString); 
                var dateObject = new Date(
                                            (+dateArray[1]),
                                            (+dateArray[2])-1, // Careful, month starts at 0!
                                            (+dateArray[3]),
                                            (+dateArray[4]),
                                            (+dateArray[5]),
                                            (+dateArray[6])
                                         );

                return dateObject;
           },
            /** @doc function.
             *  @methodOf date2string
             *  @name udoModule.service:utils#date.date2string.
             *  @description Convert a date object to UTC string in the form YYYY-mm-DD HH:MM:SS.ffffff
             *  @param dateObject a date object
             *  @return dateString a UTC string in the form YYYY-mm-DD HH:MM:SS.ffffff
             */
            date2string: function(dateObject) {
                function pad(n, d) { return n<d ? '0'+n : n; }

                return (dateObject.getFullYear() + '-' +
                        pad(dateObject.getMonth() + 1, 10) + '-' +
                        pad(dateObject.getDate(), 10) + ' ' +
                        pad(dateObject.getHours(), 10) + ':' +
                        pad(dateObject.getMinutes(), 10) + ':' +
                        pad(dateObject.getSeconds(), 10) + '.' +
                        (dateObject.getMilliseconds() * 1000).toString().padding(5, '0'));
           }
        },
        tt: {
            /** @doc function.
             *  @methodOf udoModule.service:utils
             *  @name udoModule.service:utils#date.getSemaphoreImageUrl.
             *  @description Returns the color of the semaphore
             *  @param value Time for a given time record
             *  @param maxValue Maximun time for a given time record
             *  @return the color of the semaphore
             */
            getSemaphoreImageUrl: function(value, maxValue) {
                var grades = [ '', 'green', 'yellow', 'orange', 'red' ];
                var response_ratio = (value != null && maxValue) ? value/maxValue : -1;
                
                switch (true) {
                    case (response_ratio == -1):
                        src = grades[0];
                        break;
                    case (response_ratio < 0.33):
                        src = grades[1];
                        break;
                    case (response_ratio < 0.67):
                        src = grades[2];
                        break;
                    case (response_ratio < 1.00):
                        src = grades[3];
                        break;
                    default:
                        src = grades[4];
                        break; 
                }
                return src;
            },
        }
    }
});


