describe('Enhanced Trello API Testing', () => {
    const APIKey = 'API_KEY';
    const APIToken = 'API_TOKEN';
    const baseURL = 'https://api.trello.com';
    const boardName1 = 'OnBoard';
    let boardId, listId1, listId2, cardId, labelId, memberId;

    // Step to Delete All Existing Boards Before Tests Begin
    before(() => {
        cy.request({
            method: "GET",
            url: `${baseURL}/1/members/me/boards`,
            qs: {
                key: APIKey,
                token: APIToken
            }
        }).then(response => {
            const boards = response.body;
            boards.forEach(board => {
                cy.request({
                    method: "DELETE",
                    url: `${baseURL}/1/boards/${board.id}`,
                    qs: {
                        key: APIKey,
                        token: APIToken
                    }
                }).then(deleteResponse => {
                    expect(deleteResponse.status).to.eql(200);
                });
            });
        });
    });

    // Creating a Board
    it('Creating a board', () => {
        cy.request({
            method: "POST",
            url: baseURL + "/1/boards/",
            qs: {
                name: boardName1,
                key: APIKey,
                token: APIToken
            }
        }).then(response => {
            boardId = response.body.id;
            expect(response.status).to.eql(200);
        });
    });

    // Updating the Board Name
    it('Updating the board name', () => {
        cy.request({
            method: "PUT",
            url: `${baseURL}/1/boards/${boardId}`,
            qs: {
                name: "UpdatedBoardName",
                key: APIKey,
                token: APIToken
            }
        }).then(response => {
            expect(response.status).to.eql(200);
        });
    });

    // Creating Two Lists on the Board
    it('Creating two lists on the board', () => {
        cy.request({
            method: "POST",
            url: `${baseURL}/1/lists`,
            qs: {
                name: "To Do",
                idBoard: boardId,
                key: APIKey,
                token: APIToken
            }
        }).then(response => {
            listId1 = response.body.id;
            expect(response.status).to.eql(200);
        });

        cy.request({
            method: "POST",
            url: `${baseURL}/1/lists`,
            qs: {
                name: "Done",
                idBoard: boardId,
                key: APIKey,
                token: APIToken
            }
        }).then(response => {
            listId2 = response.body.id;
            expect(response.status).to.eql(200);
        });
    });

    // Creating a Card in the First List
    it('Creating a card in the To Do list', () => {
        cy.request({
            method: "POST",
            url: `${baseURL}/1/cards`,
            qs: {
                name: "New Task",
                idList: listId1,
                key: APIKey,
                token: APIToken
            }
        }).then(response => {
            cardId = response.body.id;
            expect(response.status).to.eql(200);
        });
    });

    // Retrieving Cards from the List
    it('Retrieving cards in the To Do list', () => {
        cy.request({
            method: "GET",
            url: `${baseURL}/1/lists/${listId1}/cards`,
            qs: {
                key: APIKey,
                token: APIToken
            }
        }).then(response => {
            expect(response.status).to.eql(200);
            expect(response.body.length).to.be.greaterThan(0);
        });
    });

    // Adding a Label to the Card
    it('Adding a label to the card', () => {
        cy.request({
            method: "POST",
            url: `${baseURL}/1/labels`,
            qs: {
                name: "Urgent",
                color: "red",
                idBoard: boardId,
                key: APIKey,
                token: APIToken
            }
        }).then(response => {
            labelId = response.body.id;
            cy.request({
                method: "POST",
                url: `${baseURL}/1/cards/${cardId}/idLabels`,
                qs: {
                    value: labelId,
                    key: APIKey,
                    token: APIToken
                }
            }).then(response => {
                expect(response.status).to.eql(200);
            });
        });
    });

    // Adding a Comment to the Card
    it('Adding a comment to the card', () => {
        cy.request({
            method: "POST",
            url: `${baseURL}/1/cards/${cardId}/actions/comments`,
            qs: {
                text: "This task is urgent and should be completed by EOD.",
                key: APIKey,
                token: APIToken
            }
        }).then(response => {
            expect(response.status).to.eql(200);
        });
    });

    // Updating the Card Description
    it('Updating the card description', () => {
        cy.request({
            method: "PUT",
            url: `${baseURL}/1/cards/${cardId}`,
            qs: {
                desc: "This is a detailed task description that includes requirements and deadlines.",
                key: APIKey,
                token: APIToken
            }
        }).then(response => {
            expect(response.status).to.eql(200);
        });
    });

    // Moving the Card to the Done List
    it('Moving the card to the Done list', () => {
        cy.request({
            method: "PUT",
            url: `${baseURL}/1/cards/${cardId}`,
            qs: {
                idList: listId2,
                key: APIKey,
                token: APIToken
            }
        }).then(response => {
            expect(response.status).to.eql(200);
        });
    });

    // Adding a Member to the Board
    it('Adding a member to the board', () => {
        cy.request({
            method: "PUT",
            url: `${baseURL}/1/boards/${boardId}/members`,
            qs: {
                email: 'newmember@example.com', // Example email
                type: 'normal',
                key: APIKey,
                token: APIToken
            }
        }).then(response => {
            memberId = response.body.id;
            expect(response.status).to.eql(200);
        });
    });

    // Checking Board Memberships
    it('Checking board memberships', () => {
        cy.request({
            method: "GET",
            url: `${baseURL}/1/boards/${boardId}/memberships`,
            qs: {
                key: APIKey,
                token: APIToken
            }
        }).then(response => {
            expect(response.status).to.eql(200);
            expect(response.body.length).to.be.greaterThan(0);
        });
    });

    // Archiving a Card
    it('Archiving the card', () => {
        cy.request({
            method: "PUT",
            url: `${baseURL}/1/cards/${cardId}/closed`,
            qs: {
                value: true,
                key: APIKey,
                token: APIToken
            }
        }).then(response => {
            expect(response.status).to.eql(200);
        });
    });

    // Deleting the Card
    it('Deleting a card from the list', () => {
        cy.request({
            method: "DELETE",
            url: `${baseURL}/1/cards/${cardId}`,
            qs: {
                key: APIKey,
                token: APIToken
            }
        }).then(response => {
            expect(response.status).to.eql(200);
        });
    });

    // Deleting the Board
    it('Deleting the board', () => {
        cy.request({
            method: "DELETE",
            url: `${baseURL}/1/boards/${boardId}`,
            qs: {
                key: APIKey,
                token: APIToken
            }
        }).then(response => {
            expect(response.status).to.eql(200);
        });
    });
});
