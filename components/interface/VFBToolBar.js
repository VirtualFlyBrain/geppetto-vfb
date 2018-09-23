import React from 'react';
require('./VFBToolBar.less');
require('../../css/slideshow.min.css');
require('../../css/uikit.min.css');

export default class VFBToolBar extends React.Component {
    constructor(props) {
        super(props);
    }

	componentWillMount() {
		var head = document.head;
		var link = document.createElement("link");

		link.type = "text/css";
		link.rel = "stylesheet";
		link.href = "https://fonts.googleapis.com/css?family=Khand"

		head.appendChild(link);
	}
    
	render() {
		return (
			<nav>
				<div className="leftSide">
					<div className="wideDivL">
						<a href="https://v2.virtualflybrain.org/?i=VFB_00017894">
							<b>Virtual Fly Brain</b>
							<small className="uk-visible-large"> A hub for
								<i> Drosophila melanogaster</i>
								&nbsp;neuroscience research
							</small>
						</a>
					</div>
				</div>

				<div className="centralTitle">
					<div className="wideDivC">
						<a href="http://blog.virtualflybrain.org/post/171867319039/vfb-virtual-fly-brain-a-hub-for-drosophila" target="_Blank">Beta Testing Site</a>
					</div>
				</div>

				<div className="rightSide">
					<div className="wideDivR">
						<a href="https://v2.virtualflybrain.org/?i=VFB_00017894">Adult Brain</a>
						<a href="https://v2.virtualflybrain.org/?i=VFB_00100000">Adult VNS</a>
						<a href="https://v2.virtualflybrain.org/?i=VFB_00050000">Larva L1</a>
						<a href="https://v2.virtualflybrain.org/?i=VFB_00049000">Larva L3</a>
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						<a href="#">About</a>
						<a href="#">Contribute</a>
						<a href="#">Feedback</a>
						<a href="http://blog.virtualflybrain.org/rss" target="_Blank">
							<div className="fa fa-rss"></div>
						</a>
						<a href="https://www.facebook.com/pages/Virtual-Fly-Brain/131151036987118" target="_Blank">
							<div className="fa fa-facebook"></div>
						</a>
						<a href="http://twitter.com/virtualflybrain" target="_Blank">
							<div className="fa fa-twitter"></div>
						</a>
					</div>
				</div>
			</nav>
		);
	}
}