import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';

import slpLogo from '../assets/images/slp_logo.png';

import { addCommaToNumber } from '../helpers';

function BasicCard(props) {
	const { label, slp, slpPrice, currency } = props;

	return (
		<Card
			// variant="outlined"
			elevation={0}
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				borderRadius: '15px',
				transition: 'all 0.2s',
				// backgroundColor: '#f2f8fd',
				boxShadow: '0 8px 30px rgb(222 230 241 / 80%)',
				'&:hover': {
					transform: 'scale(1.03)',
				},
			}}
		>
			<CardContent>
				<Box sx={{ display: 'flex', m: 1, alignItems: 'center' }}>
					<Avatar alt="slp icon" src={slpLogo} sx={{ m: 1, height: 40, width: 40 }} />
					<Typography sx={{ fontSize: 28, fontWeight: 'bold' }} variant="h5" component="div">
						{addCommaToNumber(slp)}
					</Typography>
				</Box>
				<Typography
					sx={{ fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}
					// color="text.secondary"
				>
					{label}
				</Typography>
				<Typography sx={{ fontSize: 14, textAlign: 'center' }} color="text.secondary">
					≈ {addCommaToNumber((slp * slpPrice).toFixed(0))} {currency.toUpperCase()}
				</Typography>
			</CardContent>
		</Card>
	);
}

export default BasicCard;
