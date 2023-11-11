function onLoad() {
    document.addEventListener("scroll", pageOnScroll)
    pageOnScroll()
    /* document.addEventListener("mousemove", mouseOnMove, {passive: true})
    SWidth = 100
    SHeight = 100
    shadow = document.getElementById("mouse_shadow")
    shadow.style.width = SWidth + "px"
    shadow.style.height = SHeight + "px" */
    /* let img = document.getElementById("img")
    console.log(img.complete, img.naturalHeight) */



    getData(`${location.origin}/lastfm/top_artists`, (data) => {
        let top_artists = document.getElementById("top_artists")
        top_artists.innerHTML = top_artists.innerHTML.replace("{count}", data["topartists"]["@attr"]["perPage"])
        let top_artists_ = top_artists.innerHTML
        for (let artist of data["topartists"]["artist"]) {
            let a = document.createElement("a")
            let li = document.createElement("li")
            
            li.innerHTML = `${artist["@attr"]["rank"]}: `
            a.innerHTML = `${artist["name"]}`
            a.href = artist["url"]
            li.appendChild(a)
            li.innerHTML += ` (${artist["playcount"]})`
            top_artists.appendChild(li)
        }

        if (top_artists.innerHTML != top_artists_) top_artists.hidden = false
        
    })

    getData(`${location.origin}/lastfm/top_tracks`, (data) => {
        let top_tracks = document.getElementById("top_tracks")
        top_tracks.innerHTML = top_tracks.innerHTML.replace("{count}", data["toptracks"]["@attr"]["perPage"])
        let top_tracks_ = top_tracks.innerHTML
        for (let track of data["toptracks"]["track"]) {
            let a = document.createElement("a")
            let li = document.createElement("li")
            li.innerHTML = `${track["@attr"]["rank"]}: `
            a.href = track["url"]
            a.innerHTML = `${track["name"]} - ${track["artist"]["name"]}`
            li.appendChild(a)
            li.innerHTML += ` (${track["playcount"]})`
            top_tracks.appendChild(li)
        }

        if (top_tracks.innerHTML != top_tracks_) top_tracks.hidden = false
    })

    getData(`${location.origin}/lastfm/weekly_top_tracks`, (data) => {
        let weekly_top_tracks = document.getElementById("weekly_top_tracks")
        let weekly_top_tracks_ = weekly_top_tracks.innerHTML
        for (let track of data["weeklytrackchart"]["track"]) {
            let a = document.createElement("a")
            let li = document.createElement("li")
            li.innerHTML = `${track["@attr"]["rank"]}: `
            a.href = track["url"]
            a.innerHTML = `${track["name"]} - ${track["artist"]["#text"]}`
            li.appendChild(a)
            li.innerHTML += ` (${track["playcount"]})`
            weekly_top_tracks.appendChild(li)
        }

        if (weekly_top_tracks.innerHTML != weekly_top_tracks_) weekly_top_tracks.hidden = false
    })
    
    getData(`${location.origin}/lastfm/user`, (data) => {
        let music_info_desc = document.getElementById("music_info_desc")
        for (let info of Object.keys(data["user"])) {
            music_info_desc.innerHTML = music_info_desc.innerHTML.replace(`{${info}}`, data["user"][info])
        }
        let music_info_link = document.getElementById("music_info_link")
        music_info_link.href = data["user"]["url"]
    })

    loadRecentTracks()
}

async function loadRecentTracks() {
    while(true) {
        getData(`${location.origin}/lastfm/recent_tracks`, (data) => {
            let listening_to = document.getElementById("listening_to")
            let last_listened_to = document.getElementById("last_listened_to")
            let song = null
            for (let i in data["recenttracks"]["track"]) {
                let song_ = data["recenttracks"]["track"][i]
                if(song_["@attr"] && song_["@attr"]["nowplaying"] == "true") {
                    listening_to.innerHTML = `${song_["name"]} - ${song_["artist"]["name"]}`
                    listening_to.href = song_["url"]
                    listening_to.parentNode.hidden = false
    
                    let j = Number(i)+1
                    song = data["recenttracks"]["track"][j]
                    break
                }
            }

            if(last_listened_to.hidden) {
                song_ = data["recenttracks"]["track"][0]
            }
            
            if(song != null) {
                last_listened_to.innerHTML = `${song["name"]} - ${song["artist"]["name"]}`
                last_listened_to.href = song["url"]
                last_listened_to.parentNode.hidden = false
            }
            
        })
        await new Promise(r => setTimeout(r, 120000));
    }
}

function pageOnScroll(event) {
    // return // boh forse ci torno
    if (window.innerWidth > 730) return
    let elements = document.getElementsByClassName("flex-item")
    for (el of elements) {
        let elY = el.getBoundingClientRect().y
        const wHeight = window.innerHeight
        const wHeight3 = wHeight / 5
        const wHeight32 = wHeight / 10 * 6
        const clampNumber = (num, a, b) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
        // devo mettere  + el.offsetHeight da qualche parte
        //                              chiusura        : apertura
        let factor = (elY < wHeight3 ? (elY / wHeight3 + el.offsetHeight) : (wHeight32 / elY))
        el.style.width = `${70 + clampNumber(factor * 20, 0, 20)}%`
    }
}

function mouseOnMove(event) {
    shadow.style.left = `${event.pageX-(SWidth/2)}px`
    shadow.style.top = `${event.pageY-(SHeight/2)}px`
    let eFP = document.elementFromPoint(event.clientX, event.clientY)
}

async function getData(url, func) {
    let data = await fetch(url)
    if(data.status == 200) func(await data.json())
}

