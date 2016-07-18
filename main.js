/**
 * Project 2: Feedr
 * ====
 *
 * See the README.md for instructions
 */


var dataCache; //Cache the news data
var dataCacheChannels = ""; //Cache the news channels
var dataCacheTitles = []; //Cache the news titles
var imagePlaceholders = ["article_placeholder_1.jpg", "article_placeholder_2.jpg"];
var sourceName; //Current source name
var sourceNames; //Source name list

//Build the page content
function buildPageContent(articles, category) {
	if (articles) {
		for (var i=0; i<articles.length; i++) {
			if (articles[i].feature_image){
				var image = articles[i].feature_image;
			} else {
				var image = imagePlaceholders[Math.floor(Math.random() * (imagePlaceholders.length + 1))];
			}
			var display_title = articles[i].display_title;
			var channel_label = articles[i].channel_label;
			var comments_count = articles[i].comments_count;
			var articleID = i;
			var articleHTML = '<article id="'+category+'-'+i+'" class="article"><section class="featured-image"><img style="background-image:url(images/'+imagePlaceholders[Math.floor(Math.random() * (imagePlaceholders.length))]+')" src="'+image+'" alt="broken image" /></section><section class="article-content"><a onclick="openPopup('+articleID+')"><h3>'+display_title+'</h3></a><h6>'+channel_label+'</h6></section><section class="impressions">'+comments_count+'</section><div class="clearfix"></div></article>';
			document.getElementById("main").innerHTML += articleHTML;
		}
	}
}

//Hide the articles that don't need
function hideArticle(category, id) {
	var articleContent = document.getElementById(category+"-"+id);
	articleContent.style.display = "none";
}

//Show the articles that do need
function showArticle(category, id) {
	var articleContent = document.getElementById(category+"-"+id);
	articleContent.style.display = "";
}

//Build the page content according to the source name
function changeSource() {
    if (event) {
	    if (event.target.innerText=="Feedr") {
	    	sourceName = sourceNames[0];
	    } else {
	    	sourceName = event.target.innerText;
	    }
    }
    document.getElementById("sourceName").innerHTML = sourceName;
    if (dataCache[sourceName]) {
    	for (var i=0; i<sourceNames.length; i++) {
    		if (sourceName!=sourceNames[i]) {
    			for (var j=0; j<dataCache[sourceNames[i]].length; j++) {
    				hideArticle(sourceNames[i],j);	
    			}
    		} else {
    			for (var j=0; j<dataCache[sourceNames[i]].length; j++) {
    				showArticle(sourceNames[i],j);	
    			}
    		}
    	}
    }
}

//Search article by keyword
document.addEventListener('keydown', function(event) {
	if (event.target.id == "search-input") {
		setTimeout(function() {
			var searchBox = document.getElementById("search-input");
			var keyword = searchBox.value;
			if (dataCacheChannels.indexOf(keyword)<0) {
				dataCacheTitles.forEach(function(item) {
					if (item.title.toLowerCase().indexOf(keyword)<0) {
						hideArticle(item.source, item.id);
					} else {
						showArticle(item.source, item.id);
					}
				})
			} else {
				dataCacheTitles.forEach(function(item) {
					if (item.channel.toLowerCase().indexOf(keyword)<0) {
						hideArticle(item.source, item.id);
					} else {
						showArticle(item.source, item.id);
					}
				})
			}
		},500)
	}
});

//Show the article details in a popup
function openPopup(articleID) {
	document.getElementsByClassName("pop-up-container")[0].style.transform = "rotateX(0deg)";
	document.getElementById("articleDetailsTitle").innerHTML = dataCache[sourceName][articleID].display_title;
	document.getElementById("articleDetailsTitle").href = dataCache[sourceName][articleID].short_url;
	document.getElementById("articleDetailsAuthor").innerHTML = "Author: "+dataCache[sourceName][articleID].author;
	document.getElementById("articleDetailsChannel").innerHTML = "Channel: "+dataCache[sourceName][articleID].channel_label;
	document.getElementById("articleDetailsImage").src = dataCache[sourceName][articleID].image;
	document.getElementById("articleDetailsContent").innerHTML = dataCache[sourceName][articleID].content.plain;
	document.getElementById("articleDetailsReference").href = dataCache[sourceName][articleID].channel_link;
}

//Close the popup
function closePopup() {
	document.getElementById("articleDetailsImage").src = "";
    document.getElementsByClassName("pop-up-container")[0].style.transform = 'rotateX(90deg)';
}

//Save the data cache
function saveDataCache(result) {
	dataCache = result;
	for (var i=0; i<sourceNames.length; i++) {
		if (result[sourceNames[i]]) {
			var j=0;
			result[sourceNames[i]].forEach(function(item){
				if (dataCacheChannels.indexOf(item.channel_label)<0) {
					dataCacheChannels += item.channel_label+" ";
				}
				dataCacheTitles.push({"title":item.title,"source":sourceNames[i],"id":j,"channel":item.channel_label});
				j+=1;
			})
		}
	}
}

//Fetch the news source and loading the page
(function() {
 	var sourceList = document.querySelector('#source-list')
 	var container = document.querySelector('#container')
 	var state = {}
 	var topURL = 'https://crossorigin.me/https://www.reddit.com/top.json';
 	var storiesURL = 'https://crossorigin.me/http://mashable.com/stories.json';

 	renderLoading(state, container)

 	function renderLoading(data, into) {
    // TODO: Add the template
	    fetch(storiesURL)
	    .then(function(response){
	    	return response.json()
	    }).then(function(result){
	    	sourceNames = Object.keys(result);
	    	for (var i=0; i<sourceNames.length; i++) {
	    		if (!result[sourceNames[i]]) {
	    			sourceNames.splice(i,1);
	    		}
	    	}
	    	document.getElementById("sourceName").innerHTML = sourceNames[0];
	    	sourceName = sourceNames[0];
	    	saveDataCache(result);
	    	document.getElementsByClassName("loader")[0].style.display = 'none';
	    	for (var i=0; i<sourceNames.length; i++) {
	    		if (result[sourceNames[i]]) {
				 	var sourceNameHTML = '<li><a href="#" onclick="changeSource()">'+sourceNames[i]+'</a></li>';
				 	sourceList.innerHTML += sourceNameHTML;
			    	buildPageContent(dataCache[sourceNames[i]],sourceNames[i]);
	    		}
	    	}
	    	setTimeout(function() {
		    	changeSource();
	    	},300)
	    }).catch(function(error) {  
		    alert('Request failed', error)  
		});
	}
})()