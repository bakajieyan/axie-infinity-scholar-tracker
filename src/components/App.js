import React, { useState, useEffect } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import FileSaver from 'file-saver';

import styled from '@mui/material/styles/styled';

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';

import BasicCard from './BasicCard';
import CryptoBar from './CryptoBar';
import DataTable from './DataTable';
import ExportCSVButton from './ExportCSVButton';
import Form from './Form';
import Header from './Header';
import SortBySelect from './SortBySelect';
import SortTypeSelect from './SortTypeSelect';

import axie from '../assets/images/axie.png';

import {
	calcAverageSlp,
	calcLastClaimInDays,
	formatDate,
	calcNextClaimInDays,
	calcManagerShare,
	calcScholarShare,
	calcTotal,
	calcScholarPercent,
	sortArray,
} from '../helpers';

import ScholarPage from './ScholarPage';

const Input = styled('input')({
	display: 'none',
});

function App() {
	const [addresses, setAddresses] = useState([]);
	const [data, setData] = useState([]);
	const [localData, setLocalData] = useState([]);
	const [localSettings, setLocalSettings] = useState({ sort_by: 'name', sort_type: 'ascending' });
	const [cryptoData, setCryptoData] = useState({
		'smooth-love-potion': {
			php: 0,
			php_24h_change: 0,
			usd: 0,
			usd_24h_change: 0,
		},
		ethereum: {
			php: 0,
			php_24h_change: 0,
			usd: 0,
			usd_24h_change: 0,
		},
		'axie-infinity': {
			php: 0,
			php_24h_change: 0,
			usd: 0,
			usd_24h_change: 0,
		},
	});
	const [fromDelete, setFromDelete] = useState(false);
	const [currency] = useState('php');

	let sortedData;
	if (localSettings.sort_type === 'ascending') {
		sortedData = sortArray(data, localSettings.sort_by);
	} else {
		sortedData = sortArray(data, localSettings.sort_by).reverse();
	}

	useEffect(() => {
		// get scholars list
		const localStorageData = JSON.parse(localStorage.getItem('scholars'));
		if (localStorageData) {
			setAddresses(localStorageData.map((scholar) => scholar.ronin_address));
			setLocalData(localStorageData);
		}

		// get user settings
		const localStorageSettings = JSON.parse(localStorage.getItem('settings'));
		if (localStorageSettings) {
			setLocalSettings(localStorageSettings);
		}

		// get crypto prices
		axios
			.get(
				'https://api.coingecko.com/api/v3/simple/price?ids=ethereum%2Caxie-infinity%2Csmooth-love-potion&vs_currencies=php%2Cusd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=true&include_last_updated_at=false'
			)
			.then((response) => {
				setCryptoData(response.data);
			})
			.catch(() => {
				alert('Error fetching crypto data. Please try again later.');
			});
	}, []);

	useEffect(() => {
		setAddresses(localData.map((scholar) => scholar.ronin_address));
		localStorage.setItem('scholars', JSON.stringify(localData));
	}, [localData]);

	useEffect(() => {
		localStorage.setItem('settings', JSON.stringify(localSettings));
	}, [localSettings]);

	useEffect(() => {
		if (addresses.length !== 0) {
			if (!fromDelete) {
				// get scholar data
				axios
					.get(`https://game-api.axie.technology/api/v1/${addresses.join('%2C')}`)
					.then((response) => {
						let dataArray;
						if (addresses.length === 1) {
							dataArray = [response.data];
						} else {
							// convert data object to array
							dataArray = Object.values(response.data);
						}

						const finalData = dataArray.map((item, index) => {
							return {
								last_updated: formatDate(item.cache_last_updated),
								name: localData[index].name,
								ronin_address: localData[index].ronin_address,
								average_slp: calcAverageSlp(item.in_game_slp, calcLastClaimInDays(item.last_claim)),
								unclaimed_slp: item.in_game_slp,
								claimed_slp: item.total_slp - item.in_game_slp,
								total_slp: item.total_slp,
								last_claim_in_days: calcLastClaimInDays(item.last_claim),
								last_claim_date: formatDate(parseInt(`${item.last_claim}000`)),
								last_claim_raw: parseInt(`${item.last_claim}000`),
								next_claim_in_days: calcNextClaimInDays(item.next_claim),
								next_claim_date: formatDate(parseInt(`${item.next_claim}000`)),
								next_claim_raw: item.next_claim,
								manager_percent: parseInt(localData[index].manager_share),
								scholar_percent: calcScholarPercent(localData[index].manager_share),
								manager_share: calcManagerShare(item.total_slp, localData[index].manager_share),
								scholar_share: calcScholarShare(
									item.total_slp,
									calcScholarPercent(localData[index].manager_share)
								),
								mmr: item.mmr,
								rank: item.rank,
							};
						});
						setData(finalData);
					})
					.catch(() => {
						alert('Could not connect to server. Please try again later.');
					});
			} else {
				setData(data.filter((item) => addresses.includes(item.ronin_address)));
			}
		} else {
			document.body.style.cursor = 'default';
			setData([]);
		}
	}, [addresses]);

	function handleLocalDataUpdate(data, fromDelete) {
		setLocalData(data);
		setFromDelete(fromDelete);
	}

	function handleJSONDownload(data) {
		const fileName = 'scholars.json';
		const fileToSave = new Blob([JSON.stringify(data, null, 2)], {
			type: 'application/json',
		});

		FileSaver.saveAs(fileToSave, fileName);
	}

	function handleJSONUpload(event) {
		const fileReader = new FileReader();
		if (event.target.files[0]) {
			fileReader.readAsText(event.target.files[0], 'UTF-8');
			fileReader.onload = (event) => {
				setFromDelete(false); // prevents refetching of scholar data
				const JSONdata = JSON.parse(event.target.result);
				// very simple JSON validation
				if (JSONdata[0].name && JSONdata[0].ronin_address && JSONdata[0].manager_share) {
					if (JSONdata.length > 100) {
						alert('Only JSON files with max 100 ronin addresses are allowed at the moment.');
					} else {
						setLocalData(JSONdata);
					}
					// very simple validation for JSON from https://axie-scho-tracker.xyz/
				} else if (JSONdata[0].name && JSONdata[0].eth && JSONdata[0].managerShare) {
					if (JSONdata.length > 100) {
						alert('Only JSON files with max 100 ronin addresses are allowed at the moment.');
					} else {
						const convertedJSONData = JSONdata.map((item) => {
							return {
								name: item.name,
								ronin_address: item.eth,
								manager_share: item.managerShare,
							};
						});
						setLocalData(convertedJSONData);
					}
				} else {
					alert(
						'Incompatible JSON structure.\n\nOnly exported JSON from this site and https://axie-scho-tracker.xyz/ are accepted at the moment.\n\nSupport for other trackers will be added in the future.'
					);
				}
			};
		}
	}

	function cleanData(data) {
		return data.map((item) => {
			const {
				last_updated,
				ronin_address,
				name,
				average_slp,
				unclaimed_slp,
				claimed_slp,
				total_slp,
				last_claim_date,
				next_claim_date,
				manager_percent,
				scholar_percent,
				manager_share,
				scholar_share,
				mmr,
				rank,
			} = item;

			return {
				last_updated,
				name,
				ronin_address,
				average_slp,
				unclaimed_slp,
				claimed_slp,
				total_slp,
				last_claim_date,
				next_claim_date,
				manager_percent,
				scholar_percent,
				manager_share,
				scholar_share,
				mmr,
				rank,
			};
		});
	}

	function handleSortUpdate(event) {
		const { name, value } = event.target;
		setLocalSettings((prevSettings) => {
			return { ...prevSettings, [name]: value };
		});
	}

	return (
		<Box sx={{ flexGrow: 1 }}>
			<Header />
			<Container maxWidth="lg" sx={{ mb: 10 }}>
				<Switch>
					<Route path="/scholar/:name">
						<ScholarPage localData={localData} onUpdate={handleLocalDataUpdate} />
					</Route>
					<Route exact path="/">
						<CryptoBar data={cryptoData} currency={currency} />
						<Grid
							container
							spacing={2}
							sx={{
								mb: 6,
							}}
						>
							<Grid item xs={6} sm={4} lg={2}>
								<BasicCard
									label="Total Daily Average"
									slp={calcTotal(data, 'average_slp')}
									slpPrice={cryptoData['smooth-love-potion'][currency]}
									currency={currency}
								/>
							</Grid>
							<Grid item xs={6} sm={4} lg={2}>
								<BasicCard
									label="Total Unclaimed"
									slp={calcTotal(data, 'unclaimed_slp')}
									slpPrice={cryptoData['smooth-love-potion'][currency]}
									currency={currency}
								/>
							</Grid>
							<Grid item xs={6} sm={4} lg={2}>
								<BasicCard
									label="Total Claimed"
									slp={calcTotal(data, 'claimed_slp')}
									slpPrice={cryptoData['smooth-love-potion'][currency]}
									currency={currency}
								/>
							</Grid>
							<Grid item xs={6} sm={4} lg={2}>
								<BasicCard
									label="Total Farmed"
									slp={calcTotal(data, 'total_slp')}
									slpPrice={cryptoData['smooth-love-potion'][currency]}
									currency={currency}
								/>
							</Grid>
							<Grid item xs={6} sm={4} lg={2}>
								<BasicCard
									label="Manager Total"
									slp={calcTotal(data, 'manager_share')}
									slpPrice={cryptoData['smooth-love-potion'][currency]}
									currency={currency}
								/>
							</Grid>
							<Grid item xs={6} sm={4} lg={2}>
								<BasicCard
									label="Scholar Total"
									slp={calcTotal(data, 'scholar_share')}
									slpPrice={cryptoData['smooth-love-potion'][currency]}
									currency={currency}
								/>
							</Grid>
						</Grid>
						<Form
							localData={localData}
							onUpdate={handleLocalDataUpdate}
							scholars={addresses.length}
						/>
						{addresses.length !== 0 && (
							<>
								<Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
									<Typography color="text.secondary">Sort by</Typography>
									<Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
										<SortBySelect onUpdate={handleSortUpdate} localSettings={localSettings} />
										<SortTypeSelect onUpdate={handleSortUpdate} localSettings={localSettings} />
									</Box>
								</Box>
								<DataTable
									data={data}
									localData={localData}
									localSettings={localSettings}
									onDelete={handleLocalDataUpdate}
									slpPrice={cryptoData['smooth-love-potion'][currency]}
								/>
								<Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
									<Tooltip title="Download list of scholars in .json format">
										<Button
											sx={{ m: 1, minWidth: '200px' }}
											onClick={() => {
												handleJSONDownload(localData);
											}}
											startIcon={<DownloadIcon />}
											variant="outlined"
										>
											Download list
										</Button>
									</Tooltip>
									<Tooltip title="Upload list of scholars">
										<label htmlFor="upload-button">
											<Input
												onChange={handleJSONUpload}
												accept="application/JSON"
												id="upload-button"
												type="file"
											/>
											<Button
												component="span"
												startIcon={<UploadIcon />}
												variant="outlined"
												sx={{ m: 1, minWidth: '200px' }}
											>
												Upload List
											</Button>
										</label>
									</Tooltip>
									<CSVLink
										filename={'scholars.csv'}
										data={cleanData(sortedData)}
										style={{ textDecoration: 'none' }}
									>
										<ExportCSVButton />
									</CSVLink>
								</Box>
							</>
						)}
						{addresses.length === 0 && (
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									flexDirection: 'column',
								}}
							>
								<img src={axie} alt="axie" style={{ height: '150px', margin: '32px' }} />
								<Typography sx={{ mb: 10 }}>No scholars added</Typography>
								<Tooltip title="Upload list of scholars">
									<label htmlFor="upload-button">
										<Input
											onChange={handleJSONUpload}
											accept="application/JSON"
											id="upload-button"
											type="file"
										/>
										<Button
											onClick={null}
											component="span"
											startIcon={<UploadIcon />}
											variant="outlined"
											sx={{ m: 1 }}
											disableElevation
										>
											Upload list
										</Button>
									</label>
								</Tooltip>
							</Box>
						)}
					</Route>
					<Route path="*">
						<Redirect to="/" />
					</Route>
				</Switch>
			</Container>
		</Box>
	);
}

export default App;
