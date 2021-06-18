
// eslint-disable-next-line import/no-anonymous-default-export
export default {
    login: user => {
        return fetch('/login', {
            method: 'post',
            body: JSON.stringify(user),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (res.status !== 401) {
                    return res.json()
                }
                else {
                    return { isAuthenticated: false, user: { username: "", email: "" } };
                }
            }).then(data => {
                console.log(data)
                return data;
            });

    },
    register: user => {
        return fetch('/register', {
            method: 'post',
            body: JSON.stringify(user),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(data => data);

    },
    logout: () => {
        return fetch('/logout')
            .then(res => {
                console.log(res);
                return res.json()
            })
    },
    isAuthenticated: () => {
        return fetch('/authenticated', { method: 'get' }).then(res => {
            if (res.status !== 401) {

                return res.json().then(data => data);
            }
            else {
                return { isAuthenticated: false, user: { _id: "", name: "", email: "", notes: [] } };
            }

        }).then(data => {
            return data;
        });
    }

}
