(function () {
    'use strict';
    angular.module('app').service('locationHelper', [ '$location', '$routeParams', 'modalsService', service]);

    function service($location, $routeParams, modalsService) {

        return {
            closePreviousModals: modalsService.closePreviousModals,
            routeBack: routeBack,
            go: go,
            folio: folio,
            lot: lot,
            contact: contact,
            inspection: inspection,
            tenant: tenant,
            task: task,
            job: job,
            listing: listing,
            messagePreview: messagePreview,
            newEmail: newEmail,
            messageThread: messageThread,
            newSms: newSms,
            newLetter: newLetter,
            newTask: newTask,
            newRentalListing: newRentalListing,
            newSaleListing: newSaleListing,
            newJob: newJob,
            newJobQuote: newJobQuote,
            newInspection: newInspection,
            dashboard: dashboard,
            transaction: transaction,
            bill: bill,
            invoice: invoice,
            subscribe: subscribe,
        };

        function routeBack() {
            // Simple convention based on $routeParams of where to return to
            if ($routeParams.lotId) {
                lot($routeParams.lotId);
            } else if ($routeParams.contactId) {
                contact($routeParams.contactId);
            } else if ($routeParams.folioId) {
                folio($routeParams.folioId);
            } else if ($routeParams.inspectionId) {
                inspection($routeParams.inspectionId);
            } else if ($routeParams.taskId) {
                task($routeParams.taskId);
            } else if ($routeParams.jobId) {
                job($routeParams.jobId);
            } else if ( $routeParams.ListingId ) {
                listing( $routeParams.jobId, $routeParams.listingType );
            }else {
                return false;
            }
            return true;
        }

        function go(path) {
            $location.url(path);
        }

        function dashboard() {
            go('/dashboard/now');
        }

        function folio(folioId) {
            if (folioId) {
                go('/folio/transactions/' + folioId);
            } else {
                go('/dashboard/now');
            }
        }

        function lot(lotId) {
            if (lotId) {
                go('/property/card/' + lotId);
            } else {
                go('/property');
            }
        }

        function contact(contactId) {
            if (contactId) {
                go('/contact/card/' + contactId);
            } else {
                go('/contact');
            }
        }

        function inspection(inspectionId) {
            if (inspectionId) {
                go('/inspection/card/' + inspectionId);
            } else {
                go('/inspection');
            }
        }

        function tenant(folioId) {
            if (folioId) {
                go('/folio/tenant/' + folioId);
            } else {
                go('/dashboard/now');
            }
        }

        function task(taskId) {
            if (taskId) {
                go('/task/card/' + taskId);
            } else {
                go('/task');
            }
        }

        function job(jobId) {
            if (jobId) {
                go('/jobtask/card/' + jobId);
            } else {
                go('/jobtask');
            }
        }
        function listing( ListingId,listingType ) {
            if ( ListingId && listingType) {
                go( '/listing/' + listingType + '/edit/' + ListingId );
            } else {
                go( '/listing/list' );
            }
        }

        function messageThread(messageThreadId) {
            if (messageThreadId) {
                go('/message/thread/' + messageThreadId);
            } else {
                go('/message/inbox');
            }
        }

        function transaction(journalId) {
            var options = {
                component: 'mtkTransactionCard',
                resolve: {
                    id: function () {
                        return journalId;
                    }
                },
                windowClass: "modal-view"
            };

            return modalsService.openModal(options);
        }

        function bill(journalId) {
            if (journalId) {
                var options = {
                    component: 'mtkTransactionBillCard',
                    resolve: {
                        id: function () {
                            return journalId;
                        }
                    },
                    windowClass: "modal-view"
                };

                return modalsService.openModal(options);
            } else {
                go('/bill');
            }
        }

        function invoice(journalId) {
            if (journalId) {
                var options = {
                    component: 'mtkTransactionInvoiceCard',
                    resolve: {
                        id: function () {
                            return journalId;
                        }
                    },
                    windowClass: "modal-view"
                };

                var nextAction = {
                    component: 'mtkReceiptTenant',
                    resolve: {
                        bankTransaction: function () {
                            return {
                                tenancyId: ''
                            };
                        }
                    }
                };

                var thirdAction = {
                    component: 'mtkReceiptDeposit',
                    resolve: {
                        tenancyId: function () {
                            return ''
                        }
                    }
                };

                var modalresult = modalsService.openLinkedModals([options, nextAction, thirdAction]);
                return modalresult;
            } else {
                go('/invoice');
            }
        }

        function messagePreview(messageId) {
            var options = {
                component: 'mtkMessagePreview',
                resolve: {
                    id: function () {
                        return messageId;
                    }
                },
                windowClass: "modal-preview message-preview"
            };

            return modalsService.openModal(options);
        }

        function newEmail(messageId, contactId, replyToId, action) {
            var accessor = {
                opened: null,
                rendered: null
            };

            var options = {
                component: 'mtkMessageNewEmail',
                resolve: {
                    id: function () {
                        return messageId;
                    },
                    replyToId: function () {
                        return replyToId;
                    },
                    contactId: function () {
                        return contactId;
                    },
                    action: function () {
                        return action;
                    },
                    modal: function () {
                        return accessor;
                    }
                },
                windowClass: "modal-preview message-preview"
            };

            var modalResult = modalsService.openModal(options);

            accessor.opened = modalResult.opened;
            accessor.rendered = modalResult.rendered;

            return modalResult;
        }

        function newSms(messageId, contactId) {
            var options = {
                component: 'mtkMessageNewSms',
                resolve: {
                    id: function () {
                        return messageId;
                    },
                    contactId: function () {
                        return contactId;
                    }
                },
                windowClass: ""
            };

            return modalsService.openModal(options);
        }

        function newLetter(messageId, contactId) {
            var accessor = {
                opened: null,
                rendered: null
            };

            var options = {
                component: 'mtkMessageNewLetter',
                resolve: {
                    id: function () {
                        return messageId;
                    },
                    contactId: function () {
                        return contactId;
                    },
                    modal: function () {
                        return accessor;
                    }
                },
                windowClass: "modal-preview message-preview"
            };

            var modalResult = modalsService.openModal(options);

            accessor.opened = modalResult.opened;
            accessor.rendered = modalResult.rendered;

            return modalResult;
        }

        function newTask(lotId, contactId) {
            var options = {
                component: 'mtkNewTask',
                resolve: {
                    lotId: function () {
                        return lotId;
                    },
                    contactId: function () {
                        return contactId;
                    }
                },
                windowClass: "modal-task"
            };

            return modalsService.openModal(options);
        }

        function newJob(lotId, contactId) {
            var options = {
                component: 'mtkNewJob',
                resolve: {
                    lotId: function () {
                        return lotId;
                    },
                    contactId: function () {
                        return contactId;
                    }
                },
                windowClass: "modal-task"
            };

            return modalsService.openModal(options);
        }

        function newRentalListing( lotId, contactId,type ) {
            var options = {
                component: 'mtkNewRentalListing',
                resolve: {
                    lotId: function () {
                        return lotId;
                    },
                    contactId: function () {
                        return contactId;
                    },
                    type: function(){
                        return type;
                    }
                },
                windowClass: "modal-task"
            };

            return modalsService.openModal( options );
        }
        function newSaleListing( lotId, contactId, type ) {
            var options = {
                component: 'mtkNewSaleListing',
                resolve: {
                    lotId: function () {
                        return lotId;
                    },
                    contactId: function () {
                        return contactId;
                    },
                    type: function () {
                        return type;
                    }
                },
                windowClass: "modal-task"
            };

            return modalsService.openModal( options );
        }
        function newJobQuote(jobTaskQuoteId, jobTaskId) {
            var options = {
                component: 'mtkNewJobQuote',
                resolve: {
                    jobTaskQuoteId: function () {
                        return jobTaskQuoteId;
                    },
                    jobTaskId: function () {
                        return jobTaskId;
                    }
                },
                windowClass: "modal-task"
            };

            return modalsService.openModal(options);
        }

        function subscribe() {
            go('/subscriber/edit');
        }

        function newInspection(lotId, contactId) {
            var options = {
                component: 'mtkNewInspection',
                resolve: {
                    lotId: function () {
                        return lotId;
                    },
                    contactId: function () {
                        return contactId;
                    }
                },
                windowClass: "modal-task"
            };

            return modalsService.openModal(options);
        }
    }
}());