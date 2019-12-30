import React from 'react';
import './FaceRecognition.css';

const FaceRecognition = ({ imageUrl, boxes }) => {
	return (
		<div className="center ma">
			<div className="absolute mt2">
				<img
					id="inputimage"
					alt=""
					src={imageUrl}
					width="500px"
					heigh="auto"
				/>
				{/* Loop through each faceBox and create a its div element */}
				{boxes.map(box => (
					<div
						key={box.id}
						className="bounding-box"
						style={{
							top: box.topRow,
							right: box.rightCol,
							bottom: box.bottomRow,
							left: box.leftCol,
						}}
					></div>
				))}
			</div>
		</div>
	);
};

export default FaceRecognition;
