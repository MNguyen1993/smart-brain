import React, { Component } from 'react';
import Particles from 'react-particles-js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Modal from './components/Modal/Modal';
import Profile from './components/Profile/Profile';
import './App.css';

const particlesOptions = {
	particles: {
		number: {
			value: 30,
			density: {
				enable: true,
				value_area: 800,
			},
		},
	},
};

const initialState = {
	input: '',
	imageUrl: '',
	boxes: [],
	route: 'signin',
	isSignedIn: false,
	isProfileOpen: false,
	user: {
		id: '',
		name: '',
		email: '',
		entries: 0,
		joined: '',
		age: '',
	},
};

class App extends Component {
	constructor() {
		super();
		this.state = initialState;
	}

	loadUser = data => {
		this.setState({
			user: {
				id: data.id,
				name: data.name,
				email: data.email,
				entries: data.entries,
				joined: data.joined,
			},
		});
	};

	calculateFaceLocation = data => {
		const image = document.getElementById('inputimage');
		const width = Number(image.width);
		const height = Number(image.height);

		// multiple face recognition feature
		// array of all regions containing a face
		return data.outputs[0].data.regions.map(region => {
			const faceRegion = region.region_info.bounding_box;
			// calculate each faceBox from the coordinates in bounding_box
			const faceBox = {
				id: region.id,
				leftCol: faceRegion.left_col * width,
				topRow: faceRegion.top_row * height,
				rightCol: width - faceRegion.right_col * width,
				bottomRow: height - faceRegion.bottom_row * height,
			};
			return faceBox;
		});
	};

	displayFaceBox = boxes => {
		this.setState({ boxes: boxes });
	};

	onInputChange = event => {
		this.setState({ input: event.target.value });
	};

	onButtonSubmit = () => {
		this.setState({ imageUrl: this.state.input });
		fetch('http://localhost:3000/imageurl', {
			method: 'post',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				input: this.state.input,
			}),
		})
			.then(response => response.json())
			.then(response => {
				if (response) {
					fetch('http://localhost:3000/image', {
						method: 'put',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							id: this.state.user.id,
						}),
					})
						.then(response => response.json())
						.then(count => {
							this.setState(
								Object.assign(this.state.user, { entries: count })
							);
						})
						.catch(console.log);
				}
				this.displayFaceBox(this.calculateFaceLocation(response));
				console.log(this.state.boxes);
			})
			.catch(err => console.log(err));
	};

	onRouteChange = route => {
		if (route === 'signout') {
			return this.setState(initialState);
		} else if (route === 'home') {
			this.setState({ isSignedIn: true });
		}
		this.setState({ route: route });
	};

	toggleModal = () => {
		this.setState(prevState => ({
			...prevState,
			isProfileOpen: !prevState.isProfileOpen,
		}));
	};

	render() {
		const {
			isSignedIn,
			isProfileOpen,
			imageUrl,
			route,
			boxes,
			user,
		} = this.state;
		return (
			<div className="App">
				<Particles className="particles" params={particlesOptions} />
				<Navigation
					isSignedIn={isSignedIn}
					onRouteChange={this.onRouteChange}
					toggleModal={this.toggleModal}
				/>
				{isProfileOpen && (
					<Modal>
						<Profile
							isProfileOpen={isProfileOpen}
							toggleModal={this.toggleModal}
							user={user}
							loadUser={this.loadUser}
						/>
					</Modal>
				)}
				{route === 'home' ? (
					<div>
						<Logo />
						<Rank
							name={this.state.user.name}
							entries={this.state.user.entries}
						/>
						<ImageLinkForm
							onInputChange={this.onInputChange}
							onButtonSubmit={this.onButtonSubmit}
						/>
						<FaceRecognition boxes={boxes} imageUrl={imageUrl} />
					</div>
				) : route === 'signin' ? (
					<Signin
						loadUser={this.loadUser}
						onRouteChange={this.onRouteChange}
					/>
				) : (
					<Register
						loadUser={this.loadUser}
						onRouteChange={this.onRouteChange}
					/>
				)}
			</div>
		);
	}
}

export default App;
