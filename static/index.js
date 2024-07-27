let comments_offset
let total_comments_count
let has_mouse

const clampNumber = (num, a, b) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));

function onLoad() {
    let has_mouse_ = document.getElementById("has-mouse")
    has_mouse = getComputedStyle(has_mouse_).getPropertyValue('--has-mouse') == "true"

    document.addEventListener("scroll", pageOnScroll)
    /* document.addEventListener("mousemove", mouseOnMove, {passive: true})
    SWidth = 100
    SHeight = 100
    shadow = document.getElementById("mouse_shadow")
    shadow.style.width = SWidth + "px"
    shadow.style.height = SHeight + "px"
    let img = document.getElementById("img")
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

    comments_offset = 0
    loadComments()       
       

    if(has_mouse) {
        // grazie https://github.com/SchiavoAnto
        for (const iterator of document.querySelectorAll(".contact-item")) {
            const img = iterator.querySelector("a > img")
            
            iterator.onmousemove = e =>  {
                const it_rect = iterator.getBoundingClientRect()
                const img_rect = img.getBoundingClientRect()
                let x = e.clientX - img.offsetWidth / 2 - img_rect.x
                let y = e.clientY - img.offsetHeight / 2 - img_rect.y

                let sX = (Math.abs(e.clientX - (it_rect.left + it_rect.width / 2)) + 1)
                let sY = (Math.abs(e.clientY - (it_rect.top + it_rect.height / 2)) + 1)
                sX = Math.sqrt(Math.pow(it_rect.width, 2) + Math.pow(it_rect.height, 2)) / Math.sqrt(Math.pow(sX, 2) + Math.pow(sY, 1.5)) - 3
                
                const keyframes = {
                    transform: `translate(${x/2}px, ${y/3}px) scale(${clampNumber(sX, 1, 1.5)})`
                }

                img.animate(keyframes,{
                    duration: 800,
                    fill: "forwards"
                })
            }

            iterator.onmouseleave = e => {
                img.animate({transform: `translate(0px, 0px)`}, {duration: 300, fill: "forwards", easing: "cubic-bezier(.3,-0.45,.32,1.6)"})
            }
        }
    }

    
    
    pageOnScroll()
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


function loadComments() {
    getData(`${location.origin}/comments/get?offset=${comments_offset}`, (data) => {
        comment_section = document.getElementById("flex-comment-section")
        comments_anonymous = document.getElementById("comments-anonymous").innerHTML
        if(comments_offset == 0) comment_section.innerHTML = ""
        for (const comment of data["comments"]) {
            comment_div = document.createElement("div")
            comment_div.className = "flex-comment"
            
            title_div = document.createElement("div")
            title_div.className = "comment-title"

            if(comment.user == "") comment.user = comments_anonymous
            comment_title = document.createElement("h3")
            comment_title.innerHTML = comment.user
            title_div.appendChild(comment_title)


            date = comment.date.split("T")
            comment.date = `${date[0]} ${date[1]} UTC`
            comment_date = document.createElement("p")
            comment_date.innerHTML = comment.date
            title_div.appendChild(comment_date)

            comment_div.appendChild(title_div)

            comment_text = document.createElement("p")
            comment_text.innerHTML = comment.text
            comment_div.appendChild(comment_text)

            comment_section.appendChild(comment_div)
        }

        comments_offset += data["comments"].length
        total_comments_count = Number(data["count"])
        total_comments_number_text = document.getElementById("total-comments-number-text")
        total_comments_number_text.innerHTML = `(${total_comments_count})`

        load_more_comments_button = document.getElementById("load-more-comments-button")
        load_more_comments_button.hidden = (comments_offset >= total_comments_count)
    })
}

function submitComment() {
    insert_comment_section = document.getElementById("insert-comment-section")

    user = insert_comment_section.childNodes[1].childNodes[3].value
    contact = insert_comment_section.childNodes[3].childNodes[3].value
    text = insert_comment_section.childNodes[5].childNodes[3].value
    date = new Date(Date.now())
    date_ = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}T${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds().toString().padStart(2, '0')}`
    getData(`${location.origin}/comments/add?date=${date_}&user=${user}&text=${text}&contact=${contact}`, (data) => {
        if(data["status"] == "success") {
            comments_offset = 0
            loadComments()
        }
    })
}

function pageOnScroll(event) {
    // return // boh forse ci torno
    if (window.innerWidth > 730) return
    let elements = document.getElementsByClassName("mobile-animation")
    for (el of elements) {
        let elY = el.getBoundingClientRect().y
        const wHeight = window.innerHeight
        const wHeight3 = wHeight / 10
        const wHeight32 = wHeight / 10 * 6
        const closingHeight = (el.closingHeight) ? el.closingHeight : el.offsetHeight
        
        const max_factor = 20
        let chiusura = ((elY + closingHeight / 10*9) / wHeight3 )
        chiusura = max_factor
        //                             chiusura :  apertura
        let factor = (elY < wHeight3 ? chiusura : (wHeight32 / elY))
        let clampedFactor = clampNumber(factor * 20, 0, max_factor)

        if(clampedFactor == max_factor && !el.closingHeight) el.closingHeight = el.offsetHeight
        el.style.width = `${70 + clampedFactor}%`

        if(!has_mouse) {
            console.log("non")
            let gradientPosition = (Math.abs(wHeight/2 - elY - wHeight/10) ) - wHeight / 10
            el.style.backgroundPosition = `${clampNumber(gradientPosition, 0 , 70)}%`

            let img = el.querySelector('a > img')
            if(img) {
                if(el.classList.contains("invert_icon")) img.style.filter = `invert(${95 / clampNumber(gradientPosition - 50, 1, 95)}%)`

                const keyframes = {
                    transform: `scale(${1.25 / clampNumber(gradientPosition, 1, 1.25)})`
                }

                img.animate(keyframes,{
                    duration: 100,
                    fill: "forwards"
                })
            }
        }
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

