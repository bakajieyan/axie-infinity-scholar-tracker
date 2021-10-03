import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

function SortSelect(props) {
	const { onUpdate, localSettings } = props;

	const [sortBy, setSortBy] = useState('');

	useEffect(() => {
		setSortBy(localSettings.sort_by);
	}, [localSettings]);

	const handleChange = (event) => {
		setSortBy(event.target.value);
		onUpdate(event);
	};

	return (
		<Box>
			<FormControl fullWidth>
				<InputLabel id="select-label"></InputLabel>
				<Select
					sx={{ m: 2, minWidth: '125px' }}
					variant="standard"
					name="sort_by"
					labelId="select-label"
					id="sort-select"
					value={sortBy}
					label="Sort by"
					onChange={handleChange}
				>
					<MenuItem value={'name'}>Name</MenuItem>
					<MenuItem value={'average_slp'}>Daily Average SLP</MenuItem>
					<MenuItem value={'unclaimed_slp'}>Unclaimed SLP</MenuItem>
					<MenuItem value={'manager_share'}>Manager Share</MenuItem>
					<MenuItem value={'scholar_share'}>Scholar Share</MenuItem>
					<MenuItem value={'last_claim_raw'}>Last Claim</MenuItem>
					<MenuItem value={'mmr'}>MMR</MenuItem>
				</Select>
			</FormControl>
		</Box>
	);
}

export default SortSelect;
